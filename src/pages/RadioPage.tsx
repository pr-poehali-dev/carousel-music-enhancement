import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import { Track, PlayerState } from "../types/music";

interface Props {
  tracks: Track[];
  player: PlayerState;
  setPlayer: React.Dispatch<React.SetStateAction<PlayerState>>;
  onPlay: (t: Track) => void;
  onToggle: () => void;
  onNext: () => void;
  onPrev: () => void;
  seekTo: (p: number) => void;
}

export default function RadioPage({ tracks, player, onPlay, onToggle, onNext, onPrev, seekTo, setPlayer }: Props) {
  const [radioMode, setRadioMode] = useState<"shuffle" | "sequential">("shuffle");
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIdx, setQueueIdx] = useState(0);
  const autoRef = useRef(false);

  useEffect(() => {
    const q = radioMode === "shuffle"
      ? [...tracks].sort(() => Math.random() - 0.5)
      : [...tracks];
    setQueue(q);
    setQueueIdx(0);
    onPlay(q[0]);
  }, [radioMode]);

  useEffect(() => {
    if (player.progress >= 99 && player.isPlaying && !autoRef.current) {
      autoRef.current = true;
      const next = queue[(queueIdx + 1) % queue.length];
      if (next) {
        setQueueIdx(i => (i + 1) % queue.length);
        onPlay(next);
      }
      setTimeout(() => { autoRef.current = false; }, 1000);
    }
  }, [player.progress]);

  const playFromQueue = (idx: number) => {
    setQueueIdx(idx);
    onPlay(queue[idx]);
  };

  const cur = player.currentTrack;
  const prog = player.progress ?? 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl grad-btn flex items-center justify-center">
          <Icon name="Radio" size={18} className="text-white" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-white tracking-wider">РАДИО</h1>
          <p className="text-white/40 text-xs uppercase tracking-widest">Непрерывное воспроизведение</p>
        </div>
      </div>

      {/* Режим */}
      <div className="flex gap-3 mb-8">
        {(["shuffle", "sequential"] as const).map(m => (
          <button
            key={m}
            onClick={() => setRadioMode(m)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-display tracking-wider flex items-center justify-center gap-2 transition-all border
              ${radioMode === m
                ? "grad-btn text-white border-transparent"
                : "glass-card text-white/50 border-white/10 hover:text-white/80"}`}
          >
            <Icon name={m === "shuffle" ? "Shuffle" : "List"} size={14} />
            {m === "shuffle" ? "Случайно" : "По порядку"}
          </button>
        ))}
      </div>

      {/* Текущий трек */}
      {cur && (
        <div className="glass-card rounded-3xl p-6 mb-8">
          <div className="flex items-center gap-5 mb-5">
            <div className="relative flex-shrink-0">
              <img
                src={cur.cover}
                alt={cur.title}
                className={`w-24 h-24 rounded-2xl object-cover shadow-2xl ${player.isPlaying ? "animate-spin-slow" : ""}`}
                style={{ animationDuration: "8s" }}
              />
              {player.isPlaying && (
                <div className="absolute inset-0 rounded-2xl ring-2 ring-amber/60 animate-pulse" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white/40 text-xs uppercase tracking-widest mb-1">{cur.genre}</p>
              <h2 className="font-display text-xl font-bold text-white truncate">{cur.title}</h2>
              <p className="text-white/60 text-sm truncate">{cur.artist}</p>
              <p className="text-white/30 text-xs mt-1">{cur.album} · {cur.year}</p>
            </div>
          </div>

          {/* Прогресс */}
          <div className="mb-4">
            <div
              className="w-full h-1.5 rounded-full bg-white/10 cursor-pointer"
              onClick={e => {
                const r = e.currentTarget.getBoundingClientRect();
                seekTo(((e.clientX - r.left) / r.width) * 100);
              }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${prog}%`, background: "var(--grad-main, #f5a623)" }}
              />
            </div>
            <div className="flex justify-between text-white/30 text-xs mt-1">
              <span>{cur.duration}</span>
              <span>∞ Радио</span>
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex items-center justify-center gap-4">
            <button onClick={onPrev} className="w-11 h-11 glass-card rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors">
              <Icon name="SkipBack" size={20} />
            </button>
            <button
              onClick={onToggle}
              className="w-16 h-16 rounded-full grad-btn flex items-center justify-center shadow-xl"
            >
              <Icon name={player.isPlaying ? "Pause" : "Play"} size={26} className="text-white" />
            </button>
            <button onClick={onNext} className="w-11 h-11 glass-card rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors">
              <Icon name="SkipForward" size={20} />
            </button>
          </div>

          {/* Громкость */}
          <div className="flex items-center gap-3 mt-5">
            <Icon name="Volume1" size={14} className="text-white/30" />
            <input
              type="range" min={0} max={100}
              value={player.volume}
              onChange={e => setPlayer(p => ({ ...p, volume: +e.target.value }))}
              className="flex-1 accent-amber h-1"
            />
            <Icon name="Volume2" size={14} className="text-white/30" />
          </div>
        </div>
      )}

      {/* Очередь */}
      <div>
        <h3 className="font-display text-sm uppercase tracking-widest text-white/40 mb-3">
          Очередь · {queue.length} треков
        </h3>
        <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
          {queue.slice(0, 30).map((t, i) => {
            const isActive = t.id === cur?.id;
            return (
              <button
                key={t.id}
                onClick={() => playFromQueue(i)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-left
                  ${isActive ? "glass-card border border-amber/30" : "hover:bg-white/5"}`}
              >
                <span className="text-white/20 text-xs w-5 text-right flex-shrink-0">{i + 1}</span>
                <img src={t.cover} alt={t.title} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-display truncate ${isActive ? "text-amber" : "text-white/80"}`}>{t.title}</p>
                  <p className="text-white/30 text-xs truncate">{t.artist}</p>
                </div>
                <span className="text-white/20 text-xs flex-shrink-0">{t.duration}</span>
                {isActive && player.isPlaying && (
                  <span className="w-2 h-2 rounded-full bg-amber animate-pulse flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
