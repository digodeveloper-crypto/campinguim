"""uso: python qa_voz.py <pasta_do_video>
Confere cada fala da narração: transcreve com faster-whisper e aponta palavras ouvidas diferente do roteiro."""
import sys, json, re, difflib
from pathlib import Path
import numpy as np, soundfile as sf
from faster_whisper import WhisperModel

norm = lambda t: re.sub(r"[^\wà-ú]", "", t.lower())
pasta = Path(sys.argv[1])
falas = json.loads((pasta / "falas.json").read_text(encoding="utf-8"))
w, sr = sf.read(pasta / "voz.wav", dtype="float32")
m = WhisperModel(sys.argv[2] if len(sys.argv) > 2 else "small", device="cpu", compute_type="int8")
for f in falas:
    a = w[int(f["ini"] * sr):int(f["fim"] * sr)]
    a16 = np.interp(np.linspace(0, len(a) - 1, int(len(a) * 16000 / sr)), np.arange(len(a)), a).astype(np.float32)
    ouvido = " ".join(s.text for s in m.transcribe(a16, language="pt")[0]).split()
    alvo = f["texto"].split()
    sm = difflib.SequenceMatcher(a=[norm(x) for x in alvo], b=[norm(x) for x in ouvido], autojunk=False)
    dif = [f"'{' '.join(alvo[i1:i2])}' -> '{' '.join(ouvido[j1:j2])}'" for tag, i1, i2, j1, j2 in sm.get_opcodes() if tag != "equal"]
    print(f"{f['cena']:12s} {sm.ratio():.2f}  {'; '.join(dif) if dif else 'ok'}", flush=True)
