import {
  type CSSProperties,
  type PointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

/**
 * Interactive CSS-3D scene of bricks, cement bags and steel rods.
 * - No WebGL, no libraries: ~70 DOM nodes, transforms + opacity only
 * - Pointer hover / touch drag tilts the stage; idle float when allowed
 * - prefers-reduced-motion: static isometric render (no float, no tilt)
 * Loaded lazily by LazyScene; SceneFallback covers loading / no-JS.
 */

const DEFAULT_RX = -22;
const DEFAULT_RY = -34;
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

type Vec = { x: number; y: number; z: number; rot?: number };

function Cuboid({ kind, at }: { kind: 'brick' | 'bag' | 'rod'; at: Vec }) {
  const style = {
    transform: `translate3d(calc(var(--unit) * ${at.x}), calc(var(--unit) * ${at.y}), calc(var(--unit) * ${at.z})) rotateY(${at.rot ?? 0}deg)`,
  } as CSSProperties;
  return (
    <div className={`cuboid ${kind}`} style={style}>
      <div className="face face-front" />
      <div className="face face-right" />
      <div className="face face-top" />
    </div>
  );
}

// Layout in "units" – floor at y = 0, objects sit on the floor (top = -height).
const BRICKS: Vec[] = [
  { x: -17, y: -2, z: -6 },
  { x: -11, y: -2, z: -6 },
  { x: -5, y: -2, z: -6 },
  { x: -14, y: -4, z: -6 },
  { x: -8, y: -4, z: -6 },
  { x: -17, y: -6, z: -6 },
  { x: -11, y: -6, z: -6 },
  { x: -5, y: -6, z: -6 },
];
const BAGS: Vec[] = [
  { x: 3, y: -2.6, z: -5 },
  { x: 3, y: -2.6, z: 0 },
  { x: 3.2, y: -5.2, z: -2.6, rot: -7 },
];
const RODS: Vec[] = [
  { x: -12, y: -0.7, z: 7, rot: 16 },
  { x: -12, y: -0.7, z: 7.9, rot: 16 },
  { x: -12, y: -0.7, z: 8.8, rot: 16 },
  { x: -12, y: -1.4, z: 7.45, rot: 16 },
  { x: -12, y: -1.4, z: 8.35, rot: 16 },
];

export default function MaterialsScene({ label, hint }: { label: string; hint: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const angles = useRef({ rx: DEFAULT_RX, ry: DEFAULT_RY });
  const [reduced, setReduced] = useState(false);
  const [interacting, setInteracting] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const apply = useCallback(() => {
    frame.current = null;
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', `${angles.current.rx.toFixed(2)}deg`);
    el.style.setProperty('--ry', `${angles.current.ry.toFixed(2)}deg`);
  }, []);

  const schedule = useCallback(() => {
    if (frame.current === null) frame.current = window.requestAnimationFrame(apply);
  }, [apply]);

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    if (e.pointerType === 'touch' || dragging.current) {
      if (!dragging.current) return;
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      last.current = { x: e.clientX, y: e.clientY };
      angles.current.ry = clamp(angles.current.ry + dx * 0.35, -60, -8);
      angles.current.rx = clamp(angles.current.rx - dy * 0.25, -34, -8);
      schedule();
      return;
    }
    const rect = el.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    angles.current.ry = clamp(DEFAULT_RY + nx * 14, -60, -8);
    angles.current.rx = clamp(DEFAULT_RX - ny * 8, -34, -8);
    schedule();
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
    setInteracting(true);
    ref.current?.setPointerCapture(e.pointerId);
  };

  const endInteraction = () => {
    dragging.current = false;
    angles.current = { rx: DEFAULT_RX, ry: DEFAULT_RY };
    schedule();
    setInteracting(false);
  };

  const onPointerEnter = () => {
    if (!reduced) setInteracting(true);
  };

  const className = [
    'scene',
    interacting ? 'is-dragging' : '',
    !reduced && !interacting ? 'is-idle' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={ref}
      className={className}
      role="img"
      aria-label={label}
      data-testid="materials-scene"
      data-reduced-motion={reduced ? 'true' : 'false'}
      onPointerMove={onPointerMove}
      onPointerDown={onPointerDown}
      onPointerUp={endInteraction}
      onPointerCancel={endInteraction}
      onPointerLeave={endInteraction}
      onPointerEnter={onPointerEnter}
    >
      <div className="scene-stage">
        <div className="scene-ground" />
        {BRICKS.map((b) => (
          <Cuboid key={`b${b.x}${b.y}${b.z}`} kind="brick" at={b} />
        ))}
        {BAGS.map((b) => (
          <Cuboid key={`c${b.x}${b.y}${b.z}`} kind="bag" at={b} />
        ))}
        {RODS.map((r) => (
          <Cuboid key={`r${r.x}${r.y}${r.z}`} kind="rod" at={r} />
        ))}
      </div>
      {!reduced ? <span className="scene-hint">{hint}</span> : null}
    </div>
  );
}
