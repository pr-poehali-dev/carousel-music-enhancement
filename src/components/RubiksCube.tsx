import { useEffect, useRef, useState, useCallback } from "react";
import { Track, PlayerState } from "../types/music";

const GRID = 5;
const CENTER = Math.floor(GRID / 2);

const FACES = [
  { name: "front",  rotX:   0, rotY:   0, color: "rgba(220,60,60,0.55)",   border: "#e03c3c" },
  { name: "right",  rotX:   0, rotY:  90, color: "rgba(60,140,220,0.55)",  border: "#3c8cdc" },
  { name: "back",   rotX:   0, rotY: 180, color: "rgba(50,180,100,0.55)",  border: "#32b464" },
  { name: "left",   rotX:   0, rotY: -90, color: "rgba(220,170,40,0.55)",  border: "#dcaa28" },
  { name: "top",    rotX:  90, rotY:   0, color: "rgba(255,255,255,0.45)", border: "#cccccc" },
  { name: "bottom", rotX: -90, rotY:   0, color: "rgba(160,60,220,0.55)",  border: "#a03cdc" },
] as const;

const faceTransforms: Record<string, string> = {
  front:  "rotateY(0deg)   translateZ(var(--half))",
  right:  "rotateY(90deg)  translateZ(var(--half))",
  back:   "rotateY(180deg) translateZ(var(--half))",
  left:   "rotateY(-90deg) translateZ(var(--half))",
  top:    "rotateX(90deg)  translateZ(var(--half))",
  bottom: "rotateX(-90deg) translateZ(var(--half))",
};

const SEQUENCE = [
  { rotX:  -15, rotY:    0 },
  { rotX:  -15, rotY:  -90 },
  { rotX:  -15, rotY: -180 },
  { rotX:  -15, rotY: -270 },
  { rotX:  -90, rotY:    0 },
  { rotX:   90, rotY:    0 },
];

const STEP_DURATION  = 3500;
const TOAST_DURATION = 2200;

interface Toast { title: string; artist: string; color: string; key: number }

interface Props {
  tracks: Track[];
  player: PlayerState;
  onPlay: (t: Track) => void;
  onRadio: () => void;
  radioMode: boolean;
  onTogglePriority: (id: string) => void;
}

export default function RubiksCube({ tracks, player, onPlay, onRadio, radioMode, onTogglePriority }: Props) {
  const [step, setStep]         = useState(0);
  const [rotX, setRotX]         = useState(SEQUENCE[0].rotX);
  const [rotY, setRotY]         = useState(SEQUENCE[0].rotY);
  const [paused, setPaused] = useState(false);
  const [toast, setToast]   = useState<Toast | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goToStep = useCallback((s: number) => {
    const idx = ((s % SEQUENCE.length) + SEQUENCE.length) % SEQUENCE.length;
    setStep(idx);
    setRotX(SEQUENCE[idx].rotX);
    setRotY(SEQUENCE[idx].rotY);
  }, []);

  // Авторотация — всегда идёт, паузу можно включить вручную
  useEffect(() => {
    if (paused) return;
    timerRef.current = setTimeout(() => goToStep(step + 1), STEP_DURATION);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [step, paused, goToStep]);

  const showToast = useCallback((track: Track, color: string) => {
    if (toastRef.current) clearTimeout(toastRef.current);
    setToast({ title: track.title, artist: track.artist, color, key: Date.now() });
    toastRef.current = setTimeout(() => setToast(null), TOAST_DURATION);
  }, []);

  const handleTrackClick = useCallback((track: Track, color: string) => {
    onPlay(track);
    showToast(track, color);
  }, [onPlay, showToast]);

  const handleRadioClick = useCallback(() => {
    onRadio();
  }, [onRadio]);

  const size = Math.min(
    typeof window !== "undefined"
      ? Math.min(window.innerWidth * 0.78, window.innerHeight * 0.52)
      : 340,
    400
  );
  const half = size / 2;
  const gap  = 3;

  return (
    <div className="flex flex-col items-center gap-5 select-none" style={{ position: "relative" }}>

      {/* Всплывающее название */}
      {toast && (
        <div
          key={toast.key}
          style={{
            position: "absolute",
            top: -58,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(10,8,5,0.93)",
            border: `1px solid ${toast.color}`,
            borderRadius: 14,
            padding: "8px 20px",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 100,
            boxShadow: `0 0 20px ${toast.color}55`,
            animation: "toastPop 0.22s ease forwards",
          }}
        >
          <p style={{ color: "#fff", fontSize: 13, fontWeight: 700, letterSpacing: "0.04em" }}>
            {toast.title}
          </p>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, marginTop: 2 }}>
            {toast.artist}
          </p>
        </div>
      )}

      {/* Индикатор режима радио (внешний) */}
      {radioMode && (
        <div style={{
          position: "absolute", top: -54, left: "50%", transform: "translateX(-50%)",
          background: "rgba(10,8,5,0.93)", border: "1px solid #f5a623",
          borderRadius: 14, padding: "6px 16px", whiteSpace: "nowrap",
          pointerEvents: "none", zIndex: 99,
          boxShadow: "0 0 16px rgba(245,166,35,0.4)",
          fontSize: 11, color: "#f5a623", letterSpacing: "0.1em", textTransform: "uppercase",
        }}>
          📻 Радио — тапни обложку для выбора
        </div>
      )}

      {/* Индикаторы граней */}
      <div className="flex gap-2 items-center">
        {FACES.map((f, i) => (
          <button
            key={f.name}
            onClick={() => { goToStep(i); }}
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
            transition: "transform 1.1s cubic-bezier(0.45,0,0.25,1)",
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
                const col = ci % GRID;
                const row = Math.floor(ci / GRID);
                const isCenter = col === CENTER && row === CENTER;

                if (isCenter) {
                  return (
                    <div
                      key={ci}
                      onClick={handleRadioClick}
                      style={{
                        borderRadius: 5,
                        overflow: "hidden",
                        cursor: "pointer",
                        background: "#000",
                        border: radioMode ? "2px solid #f5a623" : `2px solid ${face.border}88`,
                        boxShadow: radioMode ? "0 0 12px rgba(245,166,35,0.6)" : "none",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 2,
                        transition: "border 0.3s, box-shadow 0.3s",
                      }}
                    >
                      <span style={{ fontSize: size / GRID / 2.8, lineHeight: 1 }}>
                        {radioMode ? "⏹" : "📻"}
                      </span>
                      <span style={{
                        color: radioMode ? "#f5a623" : face.border,
                        fontSize: size / GRID / 5.5,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                      }}>{radioMode ? "stop" : "radio"}</span>
                    </div>
                  );
                }

                const cellsBefore = row * GRID + col;
                const centerPos   = CENTER * GRID + CENTER;
                const adjusted    = cellsBefore < centerPos ? cellsBefore : cellsBefore - 1;
                // Если треков меньше ячеек — зацикливаем, ячейка никогда не пустая
                const trackIdx = tracks.length > 0
                  ? (fi * (GRID * GRID - 1) + adjusted) % tracks.length
                  : 0;
                const track    = tracks[trackIdx] ?? tracks[0];
                if (!track) return null;
                const isActive = player.currentTrack?.id === track.id;

                return (
                  <div
                    key={ci}
                    onClick={() => handleTrackClick(track, face.border)}
                    style={{
                      borderRadius: 5,
                      overflow: "hidden",
                      cursor: "pointer",
                      position: "relative",
                      border: isActive ? "2px solid #f5a623" : `1px solid ${face.border}55`,
                      boxShadow: isActive ? "0 0 10px rgba(245,166,35,0.7)" : "none",
                      transition: "border 0.2s, box-shadow 0.2s",
                    }}
                  >
                    <img
                      src={track.cover}
                      alt={track.title}
                      draggable={false}
                      style={{
                        width: "100%", height: "100%",
                        objectFit: "cover", display: "block",
                        pointerEvents: "none",
                      }}
                    />
                    {isActive && (
                      <div style={{
                        position: "absolute", inset: 0,
                        background: "rgba(245,166,35,0.38)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <div style={{
                          width: 7, height: 7, borderRadius: "50%",
                          background: "#f5a623", boxShadow: "0 0 10px #f5a623",
                        }} />
                      </div>
                    )}
                    {track.priority && !isActive && (
                      <div style={{
                        position: "absolute", top: 1, right: 1,
                        fontSize: cellSize * 0.28, lineHeight: 1,
                        pointerEvents: "none",
                      }}>❤️</div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Пауза авторотации */}
      <button
        onClick={() => setPaused(p => !p)}
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 20,
          padding: "6px 18px",
          color: "rgba(255,255,255,0.4)",
          fontSize: 11,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        {paused ? "▶  Авторотация" : "⏸  Пауза"}
      </button>

      <style>{`
        @keyframes toastPop {
          from { opacity: 0; transform: translateX(-50%) translateY(6px) scale(0.95); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0)    scale(1); }
        }
      `}</style>
    </div>
  );
}