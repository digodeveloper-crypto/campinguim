import React, {useMemo} from 'react';
import {random} from 'remotion';
import * as THREE from 'three';

// Escala real em metros. Partes nomeadas no padrão objeto.parte (ver PARTES.md)
export const COR = {sobreteto: '#E07A3F', quarto: '#EFE6D6', piso: '#3C4A56', destaque: '#4FD1FF'};
const L = 2.4; // comprimento
const FLY = {x: 1.08, y: 1.06, z: 1.0};
const ELEVA = 0.5; // quanto o sobreteto sobe na vista explodida

// perfil da barraca (casa de duas águas), metros
const perfil = (w: number) => {
  const s = new THREE.Shape();
  s.moveTo(-w, 0);
  s.lineTo(w, 0);
  s.lineTo(w, 1.0);
  s.lineTo(0, 1.55);
  s.lineTo(-w, 1.0);
  s.closePath();
  return s;
};

const casca = (w: number, comp: number) => {
  const g = new THREE.ExtrudeGeometry(perfil(w), {
    depth: comp,
    bevelEnabled: true,
    bevelSize: 0.035,
    bevelThickness: 0.035,
    bevelSegments: 3,
  });
  g.translate(0, 0, -comp / 2);
  return g;
};

/**
 * Ponto na água do telhado, no sistema do sobreteto (já com a escala FLY aplicada).
 * lado: -1 esquerda / +1 direita; u: 0 na beirada, 1 na cumeeira; z ao longo da barraca.
 * O recuo empurra o ponto para dentro da barraca (as gotas ficam na face interna).
 */
export const pontoTelhado = (lado: number, u: number, z: number, recuo = 0.04): [number, number, number] => {
  const nx = 0.482; // normal voltada para dentro (componentes x e y)
  const ny = -0.876;
  const x = lado * (1 - u);
  const y = 1.0 + 0.55 * u;
  return [x * FLY.x - lado * nx * recuo, y * FLY.y + ny * recuo, z * FLY.z];
};

export const levanteSobreteto = (raioX: number) => ELEVA * raioX;

const Sombra: React.FC = () => {
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d')!;
    const r = g.createRadialGradient(128, 128, 10, 128, 128, 128);
    r.addColorStop(0, 'rgba(0,0,0,0.75)');
    r.addColorStop(0.55, 'rgba(0,0,0,0.35)');
    r.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = r;
    g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]} renderOrder={-1}>
      <planeGeometry args={[6.4, 7.2]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} />
    </mesh>
  );
};

type Props = {raioX: number; frame: number; fps: number; plano: THREE.Plane[]};

export const Barraca: React.FC<Props> = ({raioX, frame, fps, plano}) => {
  const gFly = useMemo(() => casca(1.0, L), []);
  const gQuarto = useMemo(() => casca(0.86, L - 0.3), []);
  const arestas = useMemo(() => new THREE.EdgesGeometry(gFly, 30), [gFly]);
  const esfera = useMemo(() => new THREE.SphereGeometry(1, 14, 12), []);

  const gotas = useMemo(
    () =>
      Array.from({length: 70}, (_, i) => ({
        lado: random(`lado${i}`) < 0.5 ? -1 : 1,
        u: 0.08 + random(`u${i}`) * 0.88,
        z: (random(`z${i}`) - 0.5) * 2 * (L / 2 - 0.2),
        r: 0.028 + random(`r${i}`) * 0.032,
        t0: random(`t${i}`) * 2.5,
        esc: random(`e${i}`),
      })),
    [],
  );

  const t = frame / fps;
  const lift = levanteSobreteto(raioX);
  // desatura e escurece o que não é destaque
  const quartoCor = new THREE.Color(COR.quarto).lerp(new THREE.Color('#6b7078'), 0.55 * raioX).multiplyScalar(1 - 0.25 * raioX);
  const flyCor = new THREE.Color(COR.sobreteto).lerp(new THREE.Color('#7d7570'), 0.5 * raioX);

  return (
    <group>
      <Sombra />
      {/* barraca.piso */}
      <mesh name="barraca.piso" position={[0, 0.03, 0]}>
        <boxGeometry args={[1.9, 0.06, L - 0.3]} />
        <meshStandardMaterial color={COR.piso} roughness={0.85} clippingPlanes={plano} />
      </mesh>
      {/* barraca.quarto */}
      <mesh name="barraca.quarto" geometry={gQuarto} position={[0, 0.06, 0]}>
        <meshStandardMaterial color={quartoCor} roughness={0.9} side={THREE.DoubleSide} clippingPlanes={plano} />
      </mesh>
      {/* barraca.sobreteto: casca translúcida + contorno */}
      <group name="barraca.sobreteto" position={[0, lift, 0]} scale={[FLY.x, FLY.y, FLY.z]}>
        <mesh geometry={gFly}>
          <meshStandardMaterial
            color={flyCor}
            roughness={0.7}
            side={THREE.DoubleSide}
            transparent
            opacity={1 - 0.78 * raioX}
            depthWrite={raioX < 0.02}
            clippingPlanes={plano}
          />
        </mesh>
        <lineSegments geometry={arestas}>
          <lineBasicMaterial color="#FFE2CC" transparent opacity={0.9 * raioX} clippingPlanes={plano} />
        </lineSegments>
      </group>
      {/* barraca.condensacao: gotas na face interna do sobreteto, o destaque do plano */}
      <group name="barraca.condensacao" position={[0, lift, 0]}>
        {gotas.map((g, i) => {
          const cresce = Math.min(1, Math.max(0, (t - g.t0 * 0.3) / 2.2));
          const escorre = Math.min(1, Math.max(0, (t - 2.0 - g.t0 * 0.3) / 2.5)) * 0.14 * g.esc;
          const p = pontoTelhado(g.lado, Math.max(0.02, g.u - escorre * 0.8), g.z);
          const raio = g.r * (0.35 + 0.65 * cresce) * (1 + 0.25 * raioX);
          return (
            <mesh key={i} geometry={esfera} position={p} scale={[raio, raio * 1.25, raio]}>
              <meshStandardMaterial
                color="#BFEFFF"
                emissive={COR.destaque}
                emissiveIntensity={0.25 + 1.5 * raioX}
                roughness={0.1}
                metalness={0.1}
                clippingPlanes={plano}
              />
            </mesh>
          );
        })}
      </group>
    </group>
  );
};
