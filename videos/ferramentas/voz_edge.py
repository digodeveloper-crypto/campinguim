"""uso: python voz_edge.py <pasta_do_video> [voz] [rate]
Narração com voz neural da Microsoft (edge-tts), uma geração por fala. Grava voz.wav, falas.json e palavras.json
(tempo de cada palavra vem do próprio TTS, casado com o texto do roteiro)."""
import asyncio, difflib, json, re, subprocess, sys
from pathlib import Path
import numpy as np
import edge_tts

sys.path.insert(0, str(Path(__file__).parent))
from texto import para_voz  # noqa: E402

SR = 48000
PAUSA_S = 0.18


def _norm(t):
    return re.sub(r"[^\w]", "", t.lower())


async def _falar(txt, voz, rate):
    audio, marcas = bytearray(), []
    async for ch in edge_tts.Communicate(txt, voz, rate=rate, boundary="WordBoundary").stream():
        if ch["type"] == "audio":
            audio += ch["data"]
        elif ch["type"] == "WordBoundary":
            s, e, ws = ch["offset"] / 1e7, (ch["offset"] + ch["duration"]) / 1e7, ch["text"].split()
            # às vezes o serviço junta várias palavras numa marca só: reparte o tempo pelo tamanho de cada uma
            tot, acc = sum(len(x) + 1 for x in ws), 0
            for x in ws:
                marcas.append((x, s + (e - s) * acc / tot, s + (e - s) * (acc + len(x) + 1) / tot))
                acc += len(x) + 1
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", "-", "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                         input=bytes(audio), capture_output=True, check=True).stdout
    return np.frombuffer(pcm, np.float32), marcas


def _casar(alvo_txt, falado_txt, marcas):
    """tempo de cada palavra do roteiro a partir das marcas do texto falado"""
    alvo = alvo_txt.split()
    # cada palavra do roteiro vira uma ou mais palavras faladas (ex.: 4x2 -> quatro por dois)
    expand = [para_voz(w).split() for w in alvo]
    plano = [(i, f) for i, ws in enumerate(expand) for f in ws]
    sm = difflib.SequenceMatcher(a=[_norm(f) for _, f in plano], b=[_norm(m[0]) for m in marcas], autojunk=False)
    tempo = {}
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag in ("equal", "replace"):
            for k in range(i2 - i1):
                j = min(j1 + k, j2 - 1) if j2 > j1 else None
                if j is None:
                    continue
                i = plano[i1 + k][0]
                s, e = marcas[j][1], marcas[j][2]
                if k == i2 - i1 - 1 and j2 - j1 > i2 - i1:  # uma palavra falada em mais pedaços (ex.: súl—cu): vai até o último
                    e = marcas[j2 - 1][2]
                tempo[i] = (min(s, tempo.get(i, (s, e))[0]), max(e, tempo.get(i, (s, e))[1]))
    out = []
    for i, w in enumerate(alvo):
        if i not in tempo:  # interpola
            ant = out[-1]["e"] if out else 0.0
            tempo[i] = (ant, ant + 0.2)
        out.append({"w": w, "s": tempo[i][0], "e": tempo[i][1]})
    return out


async def main():
    pasta = Path(sys.argv[1])
    voz = sys.argv[2] if len(sys.argv) > 2 else "pt-BR-ThalitaMultilingualNeural"
    rate = sys.argv[3] if len(sys.argv) > 3 else "+10%"
    rot = json.loads((pasta / "roteiro.json").read_text(encoding="utf-8"))
    pausa = np.zeros(int(SR * PAUSA_S), np.float32)
    partes, t, falas, palavras = [], 0.0, [], []
    for cena, txt in rot["falas"]:
        falado = para_voz(txt)
        for tentativa in range(4):   # o serviço às vezes devolve o áudio cortado: refaz se veio curto demais
            try:
                a, marcas = await _falar(falado, voz, rate)
            except edge_tts.exceptions.NoAudioReceived:  # falha passageira do serviço
                if tentativa == 3:
                    raise
                print(f"{cena}: serviço sem áudio, refazendo", flush=True)
                await asyncio.sleep(2)
                continue
            if len(a) / SR >= len(falado) / 30:
                break
            print(f"{cena}: áudio curto ({len(a) / SR:.1f}s), refazendo", flush=True)
        lim = np.flatnonzero(np.abs(a) > 0.01)
        ini = max(0, lim[0] - int(0.02 * SR)) if len(lim) else 0
        fim = min(len(a), lim[-1] + int(0.06 * SR)) if len(lim) else len(a)
        a = a[ini:fim]
        d = len(a) / SR
        desl = t - ini / SR
        for p in _casar(txt, falado, marcas):
            palavras.append({"w": p["w"], "s": round(p["s"] + desl, 3), "e": round(p["e"] + desl, 3), "cena": cena})
        falas.append({"cena": cena, "texto": txt, "ini": round(t, 3), "fim": round(t + d, 3)})
        partes += [a, pausa]
        t += d + PAUSA_S
        print(f"{cena}: {d:.1f}s", flush=True)
    bruto = pasta / "voz_bruta.wav"
    pcm = np.concatenate(partes)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", str(bruto)], input=pcm.tobytes(), check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(bruto), "-af", "loudnorm=I=-16:TP=-1.5:LRA=9", "-ar", str(SR), str(pasta / "voz.wav")], check=True)
    (pasta / "falas.json").write_text(json.dumps(falas, ensure_ascii=False, indent=1), encoding="utf-8")
    (pasta / "palavras.json").write_text(json.dumps(palavras, ensure_ascii=False, indent=0), encoding="utf-8")
    print(f"total {t:.1f}s")


if __name__ == "__main__":
    asyncio.run(main())
