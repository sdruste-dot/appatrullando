"""Convierte un fondo generado (línea negra sobre blanco) en PNG con transparencia para el motor.
Uso: python3 fondo.py entrada.jpg salida.png [noche]
- Escala al tamaño del juego (2240x1560, escena 1120x780 a 2x).
- El blanco pasa a transparente y la línea queda opaca (alfa = oscuridad), en tinta o en claro para el turno de noche."""
import sys
from PIL import Image, ImageOps
src,dst=sys.argv[1],sys.argv[2];noche=len(sys.argv)>3 and sys.argv[3]=='noche'
im=Image.open(src).convert('L').resize((2240,1560),Image.LANCZOS)
a=ImageOps.invert(im).point(lambda v:0 if v<18 else min(255,int((v-18)*1.25)))
col=(233,228,216) if noche else (22,22,22)
out=Image.new('RGBA',im.size,col+(0,));out.putalpha(a)
out.save(dst,optimize=True)
import os;print(dst,os.path.getsize(dst)//1024,'KB')
