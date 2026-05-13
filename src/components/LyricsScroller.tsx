import { useEffect, useRef, useMemo } from "react";

interface Props {
  lyrics: string;
  progress: number;       // 0–100
  durationSec: number;   // длительность трека в секундах
  isPlaying: boolean;
}

export default function LyricsScroller({ lyrics, progress, durationSec, isPlaying }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Разбиваем текст на непустые строки (пустые — разделители строф)
  const lines = useMemo(() => {
    return lyrics.split("\n").map((text, i) => ({ text, i }));
  }, [lyrics]);

  const nonEmptyLines = useMemo(() => lines.filter(l => l.text.trim() !== ""), [lines]);

  // Текущая секунда
  const currentSec = durationSec > 0 ? (progress / 100) * durationSec : 0;

  // Каждой непустой строке — свой временной слот
  // Первые 5% — затишье, потом равномерно делим
  const activeIdx = useMemo(() => {
    if (!durationSec || nonEmptyLines.length === 0) return -1;
    const startSec = durationSec * 0.05;
    const endSec   = durationSec * 0.95;
    const secPerLine = (endSec - startSec) / nonEmptyLines.length;
    const idx = Math.floor((currentSec - startSec) / secPerLine);
    return Math.max(0, Math.min(nonEmptyLines.length - 1, idx));
  }, [currentSec, durationSec, nonEmptyLines.length]);

  // Скролл активной строки в центр контейнера
  useEffect(() => {
    if (activeIdx < 0) return;
    const container = containerRef.current;
    const lineEl = lineRefs.current[activeIdx];
    if (!container || !lineEl) return;

    const containerTop    = container.getBoundingClientRect().top;
    const lineTop         = lineEl.getBoundingClientRect().top;
    const containerHeight = container.clientHeight;
    const lineHeight      = lineEl.clientHeight;

    const targetScroll = container.scrollTop
      + (lineTop - containerTop)
      - containerHeight / 2
      + lineHeight / 2;

    container.scrollTo({ top: targetScroll, behavior: "smooth" });
  }, [activeIdx]);

  // Сопоставляем индексы: для каждой строки lines[i] — какой это nonEmptyLines индекс
  const nonEmptyIndexMap = useMemo(() => {
    const map: Record<number, number> = {};
    let counter = 0;
    lines.forEach(l => {
      if (l.text.trim() !== "") {
        map[l.i] = counter++;
      }
    });
    return map;
  }, [lines]);

  return (
    <div
      ref={containerRef}
      className="overflow-y-auto scrollbar-hide"
      style={{ maxHeight: 320, maskImage: "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)" }}
    >
      <div className="py-16 px-2 space-y-1">
        {lines.map(({ text, i }) => {
          const isEmpty   = text.trim() === "";
          const neIdx     = nonEmptyIndexMap[i] ?? -1;
          const isActive  = neIdx === activeIdx && !isEmpty;
          const isPast    = neIdx < activeIdx && !isEmpty;
          const isComing  = neIdx > activeIdx && !isEmpty;

          if (isEmpty) {
            return <div key={i} className="h-4" />;
          }

          return (
            <div
              key={i}
              ref={el => { lineRefs.current[neIdx] = el; }}
              className="text-center transition-all duration-500 leading-relaxed cursor-default select-none"
              style={{
                fontSize:    isActive ? "1.25rem" : "1rem",
                fontFamily:  isActive ? "'Bebas Neue', sans-serif" : "'IBM Plex Sans', sans-serif",
                letterSpacing: isActive ? "0.08em" : "0.02em",
                color: isActive
                  ? "#d4900a"
                  : isPast
                    ? "rgba(232,220,200,0.35)"
                    : isComing
                      ? "rgba(232,220,200,0.18)"
                      : "rgba(232,220,200,0.18)",
                textShadow: isActive
                  ? "0 0 20px rgba(212,144,10,0.5), 0 0 40px rgba(212,144,10,0.2)"
                  : "none",
                transform:   isActive ? "scale(1.02)" : "scale(1)",
                opacity: isActive ? 1 : isPast ? 0.55 : 0.28,
              }}
            >
              {isActive && isPlaying && (
                <span
                  className="inline-block mr-2 align-middle"
                  style={{
                    width: 3,
                    height: "1em",
                    background: "linear-gradient(to bottom, #d4900a, #b84a2a)",
                    borderRadius: 2,
                    verticalAlign: "middle",
                  }}
                />
              )}
              {text}
            </div>
          );
        })}
      </div>
    </div>
  );
}
