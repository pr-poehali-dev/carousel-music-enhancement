import { useEffect, useRef, useState } from "react";
import { Track, PlayerState } from "../types/music";

const GRID = 5;

// 6 граней — каждая своим цветом и своя поворотная позиция
const FACES = [
  { name: "front",  rotX:   0, rotY:   0, color: "rgba(220,60,60,0.55)",    border: "#e03c3c" },
  { name: "right",  rotX:   0, rotY:  90, color: "rgba(60,140,220,0.55)",   border: "#3c8cdc" },
  { name: "back",   rotX:   0, rotY: 180, color: "rgba(50,180,100,0.55)",   border: "#32b464" },
  { name: "left",   rotX:   0, rotY: -90, color: "rgba(220,170,40,0.55)",   border: "#dcaa28" },
  { name: "top",    rotX:  90, rotY:   0, color: "rgba(255,255,255,0.45)",  border: "#cccccc" },
  { name: "bottom", rotX: -90, rotY:   0, color: "rgba(160,60,220,0.55)",   border: "#a03cdc" },
] as const;

const faceTransforms: Record<string, string> = {
  front:  "rotateY(0deg)   translateZ(var(--half))",
  right:  "rotateY(90deg)  translateZ(var(--half))",
  back:   "rotateY(180deg) translateZ(var(--half))",
  left:   "rotateY(-90deg) translateZ(var(--half))",
  top:    "rotateX(90deg)  translateZ(var(--half))",
  bottom: "rotateX(-90deg) translateZ(var(--half))",
};

// Последовательность поворотов куба чтобы каждая грань выходила на первый план
const SEQUENCE = [
  { rotX:  -15, rotY:    0 },  // front
  { rotX:  -15, rotY:  -90 },  // right
  { rotX:  -15, rotY: -180 },  // back
  { rotX:  -15, rotY: -270 },  // left
  { rotX:  -90, rotY:    0 },  // top
  { rotX:   90, rotY:    0 },  // bottom
];

const STEP_DURATION = 3500; // мс на каждую грань

interface Props {
  tracks: Track[];
  player: PlayerState;
  onPlay: (t: Track) => void;
}

export default function RubiksCube({ tracks, player, onPlay }: Props) {
  const [step, setStep]   = useState(0);
  const [rotX, setRotX]   = useState(SEQUENCE[0].rotX);
  const [rotY, setRotY]   = useState(SEQUENCE[0].rotY);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goToStep = (s: number) => {
    const pos = SEQUENCE[s % SEQUENCE.length];
    setStep(s % SEQUENCE.length);
    setRotX(pos.rotX);
    setRotY(pos.rotY);
  };

  useEffect(() => {
    if (paused) return;
    timerRef.current = setTimeout(() => {
      goToStep(step + 1);
    }, STEP_DURATION);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [step, paused]);

  const handleClick = (track: Track) => {
    onPlay(track);
    setPaused(true);
    // через 8 секунд после нажатия возобновляем авторотацию
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setPaused(false);
    }, 8000);
  };

  const size = Math.min(
    typeof window !== "undefined" ? Math.min(window.innerWidth * 0.78, window.innerHeight * 0.52) : 340,
    400
  );
  const half = size / 2;
  const cellSize = size / GRID;
  const gap = 3;

  return (
    <div className="flex flex-col items-center gap-6 select-none">

      {/* Индикатор текущей грани */}
      <div className="flex gap-2 items-center">
        {FACES.map((f, i) => (
          <button
            key={f.name}
            onClick={() => { goToStep(i); setPaused(true); setTimeout(() => setPaused(false), 8000); }}
            style={{
              width: i === step ? 22 : 8,
              height: 8,
              borderRadius: 4,
              background: i === step ? f.border : "rgba(255,255,255,0.15)",
              transition: "all 0.4s ease",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          />
        ))}
      </div>

      {/* Куб */}
      <div style={{ width: size, height: size, perspective: size * 2.8 }}>
        <div
          style={{
            width: size,
            height: size,
            position: "relative",
            transformStyle: "preserve-3d",
            transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
            transition: "transform 1.1s cubic-bezier(0.45, 0, 0.25, 1)",
            ["--half" as string]: `${half}px`,
          }}
        >
          {FACES.map((face, fi) => (
            <div
              key={face.name}
              style={{
                position: "absolute",
                width: size,
                height: size,
                transformStyle: "preserve-3d",
                transform: faceTransforms[face.name],
                backfaceVisibility: "hidden",
                background: face.color,
                border: `3px solid ${face.border}`,
                borderRadius: 14,
                display: "grid",
                gridTemplateColumns: `repeat(${GRID}, 1fr)`,
                gridTemplateRows: `repeat(${GRID}, 1fr)`,
                gap,
                padding: 6,
                boxSizing: "border-box",
                boxShadow: step === fi
                  ? `0 0 40px ${face.border}88, inset 0 0 20px ${face.border}33`
                  : "none",
              }}
            >
              {Array.from({ length: GRID * GRID }, (_, ci) => {
                const trackIdx = (fi * GRID * GRID + ci) % tracks.length;
                const track = tracks[trackIdx];
                const isActive = player.currentTrack?.id === track.id;
                return (
                  <div
                    key={ci}
                    onClick={() => handleClick(track)}
                    style={{
                      borderRadius: 5,
                      overflow: "hidden",
                      cursor: "pointer",
                      position: "relative",
                      border: isActive
                        ? "2px solid #f5a623"
                        : `1px solid ${face.border}66`,
                      boxShadow: isActive ? "0 0 10px rgba(245,166,35,0.7)" : "none",
                      transition: "border 0.2s, box-shadow 0.2s",
                    }}
                  >
                    <img
                      src={track.cover}
                      alt={track.title}
                      draggable={false}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        pointerEvents: "none",
                      }}
                    />
                    {isActive && (
                      <div style={{
                        position: "absolute", inset: 0,
                        background: "rgba(245,166,35,0.4)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <div style={{
                          width: 8, height: 8, borderRadius: "50%",
                          background: "#f5a623", boxShadow: "0 0 10px #f5a623",
                        }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Пауза / воспроизведение авторотации */}
      <button
        onClick={() => setPaused(p => !p)}
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 20,
          padding: "6px 18px",
          color: "rgba(255,255,255,0.45)",
          fontSize: 11,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        {paused ? "▶  Авторотация" : "⏸  Пауза"}
      </button>
    </div>
  );
}
