"""Texto do roteiro -> texto falado (siglas por extenso; os TTS leem "4x2" de qualquer jeito)."""
import re

FALADO = [("4x4", "quatro por quatro"), ("4x2", "quatro por dois"), ("4L", "quatro éle"), ("2H", "dois agá")]
# grafia fonética de palavras que o TTS fala errado (palavra inteira; a legenda continua com o texto do roteiro)
# "sulco" saía "suco" (Reel 25): o áudio fica no limite e o whisper large-v3 vira por pouco (cortar 0,07 s de silêncio já
# muda). "súlco", "sul-co", "sul—cu", "súl—cu" e "súl—co" falhavam depois do corte/loudnorm do voz_edge; "súlh—co" passou
# 4 de 4 nas duas falas. O travessão parte a palavra em duas marcas do TTS; o voz_edge junta o tempo das duas. "sulcos" sai certo.
# "Choveu" saía "Rová" (Reel 32): "Chovêu", "Chôveu", "Chô—vêu", "Chuvêu" e pausa antes falhavam no large-v3.
# "Xovêu" passava na frase sozinha, mas no vídeo montado virava "Que só vê um"; "Xouvêu", "Chouvêu", "Xôvêu" também
# falharam. "Shovêu" saiu "Choveu na cabeceira?" com 0 s, 6 s e 0,2 s de contexto antes.
# "pente" saía "pêinti" e o large-v3 ouvia "Paint" (escada rolante, 11/11). Nas 7 falas com a palavra: "pente" passou 6/7,
# "pêntê" 6/7, "pén—te" 5/7, "pen—tchi" 2/7 e "pentchi" 1/7 (vira "penti" escrito) a +5%; "pênti" passou 7/7 a +5% e a +15%.
# "Isopor" no começo de frase saía "Exopor" no large-v3 (isopor longo, 12/11); "Izopor", "Isopór" e "Izopôr" também.
# "I-sopor" passou; no meio da frase "isopor" já sai certo ("ísopor" ali virava "ísopo"), por isso a regra só pega depois de ponto.
# "bolhinhas" virava "bolinhas" em 8 grafias (bôlhinhas, bólhinhas, bolh—inhas...): o roteiro passou a dizer "bolhas".
# "pisar" saía "pesar" no large-v3 (Reel 26, "sem pisar no freio", 12/11); "pizar", "pisár" e "pizár" também.
# "pi-sar" e "pi—zar" passaram (na frase sozinha e com o vídeo antes).
# "a vala está funda" saía "a vale" no large-v3 (Reel 28, 13/11); "vála", "váala", "vá-la", "válla", "válah", "valha" e
# "vál—la" também ("válla" passava no TTS cru e falhava depois do corte/loudnorm do voz_edge). "vá—la" e "váh—la" passavam,
# mas o travessão esticava a palavra (0,33 s, soava picado; QA 13/11); "vàla", "váhla", "vahla", "Vala", "valah" e "vállah"
# falharam. "vâla" passou 3 de 3 nas duas falas, sem travessão e com duração normal ("valas" no plural já sai certo).
FONETICA = [(r"\bvala\b", "vâla"), (r"\bsulco\b", "súlh—co"), (r"\bchoveu\b", "shovêu"), (r"\bpente\b", "pênti"), (r"(?<=\. )Isopor\b", "I-sopor"), (r"\bpisar\b", "pi-sar")]


def para_voz(txt):
    for a, b in FALADO:
        txt = txt.replace(a, b)
    for re_, b in FONETICA:
        txt = re.sub(re_, lambda m: b[0].upper() + b[1:] if m.group()[0].isupper() else b, txt, flags=re.I)
    return txt
