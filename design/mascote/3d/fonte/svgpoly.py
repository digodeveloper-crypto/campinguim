# Leitor mínimo de caminhos SVG (só comandos absolutos M, L, C, A, Z, que é o que o vetor aprovado usa).
# Converte caminho, retângulo, círculo e elipse em polígonos, para medir o desenho.
import re, math
def _tok(d):
    return re.findall(r'[MCLAZ]|-?\d*\.?\d+(?:e-?\d+)?', d)
def _arc(x0,y0,rx,ry,phi,fa,fs,x,y,n=16):
    # SVG arc endpoint -> center param
    phi=math.radians(phi); c,s=math.cos(phi),math.sin(phi)
    dx,dy=(x0-x)/2,(y0-y)/2
    x1=c*dx+s*dy; y1=-s*dx+c*dy
    lam=x1*x1/(rx*rx)+y1*y1/(ry*ry)
    if lam>1: rx*=math.sqrt(lam); ry*=math.sqrt(lam)
    num=rx*rx*ry*ry-rx*rx*y1*y1-ry*ry*x1*x1
    den=rx*rx*y1*y1+ry*ry*x1*x1
    co=math.sqrt(max(0,num/den)) if den else 0
    if fa==fs: co=-co
    cx1=co*rx*y1/ry; cy1=-co*ry*x1/rx
    cx=c*cx1-s*cy1+(x0+x)/2; cy=s*cx1+c*cy1+(y0+y)/2
    def ang(u,v):
        a=math.atan2(v[1],v[0])-math.atan2(u[1],u[0]); return a
    t1=math.atan2((y1-cy1)/ry,(x1-cx1)/rx)
    dt=math.atan2((-y1-cy1)/ry,(-x1-cx1)/rx)-t1
    if fs==0 and dt>0: dt-=2*math.pi
    if fs==1 and dt<0: dt+=2*math.pi
    pts=[]
    for i in range(1,n+1):
        t=t1+dt*i/n
        px=rx*math.cos(t); py=ry*math.sin(t)
        pts.append((c*px-s*py+cx, s*px+c*py+cy))
    return pts
def path_to_polys(d, nseg=6):
    t=_tok(d); i=0; polys=[]; cur=None; cmd=None; x=y=0
    def num():
        nonlocal i; v=float(t[i]); i+=1; return v
    while i<len(t):
        if t[i] in 'MCLAZ': cmd=t[i]; i+=1
        if cmd=='M':
            x,y=num(),num(); cur=[(x,y)]; polys.append(cur); cmd='L'
        elif cmd=='L':
            x,y=num(),num(); cur.append((x,y))
        elif cmd=='C':
            x1,y1,x2,y2,x3,y3=[num() for _ in range(6)]
            for k in range(1,nseg+1):
                u=k/nseg; a=(1-u)**3; b=3*u*(1-u)**2; c=3*u*u*(1-u); e=u**3
                cur.append((a*x+b*x1+c*x2+e*x3, a*y+b*y1+c*y2+e*y3))
            x,y=x3,y3
        elif cmd=='A':
            rx,ry,ph,fa,fs,x3,y3=[num() for _ in range(7)]
            cur.extend(_arc(x,y,rx,ry,ph,int(fa),int(fs),x3,y3)); x,y=x3,y3
        elif cmd=='Z':
            pass
    return polys
def elements(svgtext):
    out=[]
    for m in re.finditer(r'<(path|rect|circle|ellipse)\b([^>]*)/?>', svgtext):
        tag, attrs = m.group(1), m.group(2)
        a=dict(re.findall(r'([\w-]+)="([^"]*)"', attrs))
        out.append((tag,a))
    return out
def shape_polys(tag,a):
    if tag=='path': return path_to_polys(a['d'])
    if tag=='rect':
        x,y,w,h=[float(a[k]) for k in ('x','y','width','height')]; r=float(a.get('rx',0))
        pts=[]
        for cx,cy,a0 in ((x+w-r,y+r,-90),(x+w-r,y+h-r,0),(x+r,y+h-r,90),(x+r,y+r,180)):
            for k in range(9):
                an=math.radians(a0+90*k/8); pts.append((cx+r*math.cos(an),cy+r*math.sin(an)))
        return [pts]
    if tag in('circle','ellipse'):
        cx,cy=float(a['cx']),float(a['cy'])
        rx=float(a.get('r',a.get('rx'))); ry=float(a.get('r',a.get('ry')))
        return [[(cx+rx*math.cos(2*math.pi*k/48), cy+ry*math.sin(2*math.pi*k/48)) for k in range(48)]]
def bbox(polys):
    xs=[p[0] for q in polys for p in q]; ys=[p[1] for q in polys for p in q]
    return (round(min(xs),1),round(min(ys),1),round(max(xs),1),round(max(ys),1))
def xspan(poly,y):
    xs=[]
    n=len(poly)
    for k in range(n):
        (x0,y0),(x1,y1)=poly[k],poly[(k+1)%n]
        if (y0<=y<y1) or (y1<=y<y0):
            xs.append(x0+(y-y0)*(x1-x0)/(y1-y0))
    return (min(xs),max(xs)) if xs else None
