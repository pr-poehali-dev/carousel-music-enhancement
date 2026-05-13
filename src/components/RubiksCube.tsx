import { useRef, useState, useCallback } from "react";
import { Track, PlayerState } from "../types/music";

const GRID = 5;
const FACES = ["front", "back", "left", "right", "top", "bottom"] as const;
type Face = typeof FACES[number];

interface Props {
  tracks: Track[];
  player: PlayerState;
  onPlay: (t: Track) => void;
}

const faceTransforms: Record<Face, string> = {
  front:  "rotateY(0deg)   translateZ(var(--half))",
  back:   "rotateY(180deg) translateZ(var(--half))",
  left:   "rotateY(-90deg) translateZ(var(--half))",
  right:  "rotateY(90deg)  translateZ(var(--half))",
  top:    "rotateX(90deg)  translateZ(var(--half))",
  bottom: "rotateX(-90deg) translateZ(var(--half))",
};

const faceColors: Record<Face, string> = {
  front:  "rgba(255,80,80,0.15)",
  back:   "rgba(80,140,255,0.15)",
  left:   "rgba(255,200,80,0.15)",
  right:  "rgba(80,255,140,0.15)",
  top:    "rgba(255,255,255,0.12)",
  bottom: "rgba(180,80,255,0.15)",
};

export default function RubiksCube({ tracks, player, onPlay }: Props) {
  const [rotX, setRotX] = useState(-25);
  const [rotY, setRotY] = useState(30);
  const dragRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const velRef  = useRef({ x: 0, y: 0 });
  const rafRef  = useRef<number>(0);
  const rotRef  = useRef({ x: -25, y: 30 });
  const isDragging = useRef(false);

  const startInertia = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    const step = () => {
      velRef.current.x *= 0.93;
      velRef.current.y *= 0.93;
      if (Math.abs(velRef.current.x) < 0.05 && Math.abs(velRef.current.y) < 0.05) return;
      rotRef.current.x += velRef.current.x;
      rotRef.current.y += velRef.current.y;
      setRotX(rotRef.current.x);
      setRotY(rotRef.current.y);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, active: true };
    isDragging.current = false;
    velRef.current = { x: 0, y: 0 };
    cancelAnimationFrame(rafRef.current);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) isDragging.current = true;
    velRef.current.y = dx * 0.4;
    velRef.current.x = -dy * 0.4;
    rotRef.current.x += velRef.current.x;
    rotRef.current.y += velRef.current.y;
    setRotX(rotRef.current.x);
    setRotY(rotRef.current.y);
    dragRef.current.x = e.clientX;
    dragRef.current.y = e.clientY;
  }, []);

  const onPointerUp = useCallback(() => {
    dragRef.current.active = false;
    startInertia();
  }, [startInertia]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    dragRef.current = { x: t.clientX, y: t.clientY, active: true };
    isDragging.current = false;
    velRef.current = { x: 0, y: 0 };
    cancelAnimationFrame(rafRef.current);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragRef.current.active) return;
    e.preventDefault();
    const t = e.touches[0];
    const dx = t.clientX - dragRef.current.x;
    const dy = t.clientY - dragRef.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) isDragging.current = true;
    velRef.current.y = dx * 0.4;
    velRef.current.x = -dy * 0.4;
    rotRef.current.x += velRef.current.x;
    rotRef.current.y += velRef.current.y;
    setRotX(rotRef.current.x);
    setRotY(rotRef.current.y);
    dragRef.current.x = t.clientX;
    dragRef.current.y = t.clientY;
  }, []);

  const onTouchEnd = useCallback(() => {
    dragRef.current.active = false;
    startInertia();
  }, [startInertia]);

  const handleCellClick = useCallback((track: Track) => {
    if (!isDragging.current) onPlay(track);
  }, [onPlay]);

  const size = Math.min(typeof window !== "undefined" ? window.innerWidth * 0.72 : 360, 420);
  const cellSize = size / GRID;
  const half = size / 2;

  return (
    <div
      className="select-none cursor-grab active:cursor-grabbing"
      style={{ width: size, height: size, perspective: size * 2.2 }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div
        style={{
          width: size,
          height: size,
          position: "relative",
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          transition: dragRef.current.active ? "none" : "transform 0.05s linear",
          ["--half" as string]: `${half}px`,
        }}
      >
        {FACES.map((face, fi) => {
          const faceOffset = fi * GRID * GRID;
          return (
            <div
              key={face}
              style={{
                position: "absolute",
                width: size,
                height: size,
                transformStyle: "preserve-3d",
                transform: faceTransforms[face],
                backfaceVisibility: "hidden",
                background: faceColors[face],
                border: "2px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                display: "grid",
                gridTemplateColumns: `repeat(${GRID}, 1fr)`,
                gridTemplateRows: `repeat(${GRID}, 1fr)`,
                gap: 3,
                padding: 6,
                boxSizing: "border-box",
              }}
            >
              {Array.from({ length: GRID * GRID }, (_, ci) => {
                const trackIdx = (faceOffset + ci) % tracks.length;
                const track = tracks[trackIdx];
                const isActive = player.currentTrack?.id === track.id;
                return (
                  <div
                    key={ci}
                    onClick={() => handleCellClick(track)}
                    style={{
                      width: cellSize - 9,
                      height: cellSize - 9,
                      borderRadius: 6,
                      overflow: "hidden",
                      cursor: "pointer",
                      position: "relative",
                      border: isActive ? "2px solid #f5a623" : "2px solid rgba(255,255,255,0.1)",
                      boxShadow: isActive ? "0 0 10px rgba(245,166,35,0.6)" : "none",
                      transition: "border 0.2s, box-shadow 0.2s",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={track.cover}
                      alt={track.title}
                      draggable={false}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none" }}
                    />
                    {isActive && (
                      <div style={{
                        position: "absolute", inset: 0,
                        background: "rgba(245,166,35,0.35)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f5a623", boxShadow: "0 0 8px #f5a623" }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
