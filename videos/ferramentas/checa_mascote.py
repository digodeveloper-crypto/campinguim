"""uso: python checa_mascote.py <video.mp4> [quadros_esperados]
Confere TODOS os quadros de um vídeo do mascote: mede, numa região fixa do corpo (centro do quadro), a fração de pixels
claros (face, barriga, gorro). Um quadro sem o mascote fica só com o fundo escuro e cai perto de zero.
Acusa quadro com menos da metade da mediana dos vizinhos (janela de 7) ou abaixo de 3% da região.
Sai com erro se houver quadro suspeito ou se o número de quadros não for o esperado."""
import subprocess
import sys

import numpy as np

video = sys.argv[1]
esperado = int(sys.argv[2]) if len(sys.argv) > 2 else None
W, H = 270, 480  # reduzido 4x: basta para achar o mascote e lê os 150 quadros em segundos
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", video, "-vf", f"scale={W}:{H}", "-f", "rawvideo", "-pix_fmt", "gray", "-"],
                     capture_output=True, check=True).stdout
q = np.frombuffer(raw, np.uint8).reshape(-1, H, W)
# região do corpo: x de 23% a 77%, y de 36% a 70% (abaixo do rótulo, acima da legenda)
reg = q[:, int(0.36 * H):int(0.70 * H), int(0.23 * W):int(0.77 * W)].astype(np.float32)
frac = (reg > 110).mean(axis=(1, 2))
n = len(frac)
susp = []
for i, f in enumerate(frac):
    viz = np.median(np.r_[frac[max(0, i - 3):i], frac[i + 1:i + 4]])
    if f < 0.03 or f < 0.5 * viz:
        susp.append((i, f, viz))
print(f"{video}: {n} quadros; fração clara na região do corpo: mín {frac.min():.3f} (quadro {int(frac.argmin())}), "
      f"mediana {np.median(frac):.3f}, máx {frac.max():.3f}")
for i, f, viz in susp:
    print(f"  SUSPEITO quadro {i} ({i / 30:.2f} s): {f:.3f} contra {viz:.3f} dos vizinhos")
ok = not susp and (esperado is None or n == esperado)
if esperado is not None and n != esperado:
    print(f"  ERRO: {n} quadros, esperado {esperado}")
print("resultado:", "ok" if ok else "FALHA")
sys.exit(0 if ok else 1)
