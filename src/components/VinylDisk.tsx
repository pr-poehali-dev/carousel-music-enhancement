import { useEffect, useRef } from "react";

interface Props {
  cover: string;
  isPlaying: boolean;
  size?: number;
}

export default function VinylDisk({ cover, isPlaying, size = 220 }: Props) {
  const rotationRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);
  const diskRef = useRef<HTMLDivElement>(null);
  const lastTimestampRef = useRef<number | null>(null);

  // Плавное вращение через JS для точного контроля угла
  useEffect(() => {
    if (isPlaying) {
      const rpm = 33.3;
      const degPerMs = (rpm * 360) / 60000;

      const tick = (timestamp: number) => {
        if (lastTimestampRef.current !== null) {
          const delta = timestamp - lastTimestampRef.current;
          rotationRef.current = (rotationRef.current + degPerMs * delta) % 360;
          if (diskRef.current) {
            diskRef.current.style.transform = `rotate(${rotationRef.current}deg)`;
          }
        }
        lastTimestampRef.current = timestamp;
        animFrameRef.current = requestAnimationFrame(tick);
      };

      animFrameRef.current = requestAnimationFrame(tick);
    } else {
      lastTimestampRef.current = null;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying]);

  const s = size;
  const r = s / 2;
  // Тонарм: шарнир справа-сверху, когда играет — опускается на диск
  const armAnglePlaying = -28;  // градусы от вертикали (иголка на диске)
  const armAngleParked  = -6;   // поднята
  const armAngle = isPlaying ? armAnglePlaying : armAngleParked;

  return (
    <div className="relative select-none" style={{ width: s + 60, height: s + 20 }}>

      {/* ── Тонарм (svg) ───────────────────────────── */}
      <div
        className="absolute z-20"
        style={{
          right: 0,
          top: -10,
          width: 70,
          height: s * 0.85,
          transformOrigin: "top right",
          transform: `rotate(${armAngle}deg)`,
          transition: isPlaying
            ? "transform 0.9s cubic-bezier(0.4,0,0.2,1)"
            : "transform 0.7s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <svg width="70" height={s * 0.85} viewBox={`0 0 70 ${s * 0.85}`} fill="none">
          {/* Шарнир */}
          <circle cx="58" cy="10" r="8" fill="#2a2018" stroke="#d4900a" strokeWidth="1.5" />
          <circle cx="58" cy="10" r="3.5" fill="#d4900a" opacity="0.7" />

          {/* Трубка тонарма */}
          <path
            d={`M58 18 Q 50 ${s * 0.4} 12 ${s * 0.82}`}
            stroke="#3a2e20"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d={`M58 18 Q 50 ${s * 0.4} 12 ${s * 0.82}`}
            stroke="#c47a3a"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* Головка звукоснимателя */}
          <rect
            x="4" y={s * 0.80}
            width="16" height="8"
            rx="2"
            fill="#1a1410"
            stroke="#8a7a6a"
            strokeWidth="1"
            transform={`rotate(15 12 ${s * 0.84})`}
          />
          {/* Иголка */}
          <line
            x1="9" y1={s * 0.87}
            x2="6" y2={s * 0.885}
            stroke="#d4900a"
            strokeWidth="1.5"
            strokeLinecap="round"
            transform={`rotate(15 12 ${s * 0.84})`}
          />
        </svg>
      </div>

      {/* ── Виниловый диск ─────────────────────────── */}
      <div
        className="absolute left-0 top-0"
        style={{ width: s, height: s }}
      >
        {/* Свечение */}
        <div
          className={`absolute rounded-full ${isPlaying ? "vinyl-playing" : ""}`}
          style={{
            inset: -4,
            boxShadow: isPlaying ? undefined : "0 8px 32px rgba(0,0,0,0.6)",
            borderRadius: "50%",
          }}
        />

        {/* Сам диск — вращается */}
        <div
          ref={diskRef}
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{ background: "#0e0b08" }}
        >
          {/* Обложка в центре */}
          <img
            src={cover}
            alt=""
            className="absolute rounded-full object-cover"
            style={{ inset: "22%", opacity: 0.65 }}
          />

          {/* Концентрические канавки */}
          {Array.from({ length: 9 }, (_, i) => {
            const pct = 8 + i * 5;
            return (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  inset: `${pct}%`,
                  border: `1px solid rgba(255,255,255,${0.025 - i * 0.001})`,
                }}
              />
            );
          })}

          {/* Радужный отлив (имитация поливинилхлорида) */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "conic-gradient(from 0deg, transparent 0%, rgba(212,144,10,0.06) 15%, transparent 30%, rgba(184,74,42,0.05) 50%, transparent 65%, rgba(196,122,58,0.06) 80%, transparent 100%)",
            }}
          />

          {/* Центральная этикетка */}
          <div
            className="absolute rounded-full flex items-center justify-center"
            style={{
              inset: "38%",
              background: "radial-gradient(circle, #2a1e0e 0%, #1a1008 100%)",
              border: "1px solid rgba(212,144,10,0.3)",
            }}
          >
            {/* Шпиндель */}
            <div
              className="rounded-full"
              style={{
                width: "28%",
                height: "28%",
                background: "radial-gradient(circle, #d4900a 0%, #8a5a0a 100%)",
              }}
            />
          </div>
        </div>

        {/* Блик сверху (не вращается) */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 60% 40% at 35% 25%, rgba(255,255,255,0.06) 0%, transparent 70%)",
          }}
        />
      </div>
    </div>
  );
}