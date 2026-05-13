import Icon from "@/components/ui/icon";
import { PlayerState } from "../types/music";

interface Props {
  player: PlayerState;
  onToggle: () => void;
  onOpen: () => void;
  onNext: () => void;
  onPrev: () => void;
  setPlayer: (fn: (p: PlayerState) => PlayerState) => void;
  seekTo: (pct: number) => void;
}

export default function MiniPlayer({ player, onToggle, onOpen, onNext, onPrev, setPlayer, seekTo }: Props) {
  const { currentTrack, isPlaying, progress, volume } = player;
  if (!currentTrack) return null;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    seekTo(Math.max(0, Math.min(100, pct)));
  };

  return (
    <div className="player-bar fixed bottom-0 left-0 right-0 z-50 px-4 py-3">
      <div className="max-w-7xl mx-auto">
        {/* Progress bar */}
        <div
          className="relative h-0.5 rounded-full bg-white/10 mb-3 cursor-pointer group"
          onClick={handleSeek}
        >
          <div
            className="progress-bar h-full rounded-full transition-none relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-amber opacity-0 group-hover:opacity-100 transition-opacity shadow" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Cover */}
          <button onClick={onOpen} className="relative flex-shrink-0 group">
            <img
              src={currentTrack.cover}
              alt={currentTrack.title}
              className="w-10 h-10 rounded object-cover"
            />
            {isPlaying && (
              <div className="absolute inset-0 rounded bg-black/50 flex items-end justify-center pb-1 gap-[2px]">
                <span className="eq-bar" style={{ height: '6px' }} />
                <span className="eq-bar" style={{ height: '10px' }} />
                <span className="eq-bar" style={{ height: '5px' }} />
                <span className="eq-bar" style={{ height: '9px' }} />
              </div>
            )}
          </button>

          {/* Info */}
          <div className="flex-1 min-w-0 cursor-pointer" onClick={onOpen}>
            <p className="text-sm font-semibold truncate text-foreground font-display tracking-wide">{currentTrack.title}</p>
            <p className="text-xs text-foreground/40 truncate">{currentTrack.artist}</p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1">
            <button onClick={onPrev} className="flex flex-col items-center gap-0.5 p-1.5 text-foreground/40 hover:text-foreground transition-colors hidden sm:flex">
              <Icon name="SkipBack" size={17} />
              <span className="text-[8px] uppercase tracking-wider leading-none">Назад</span>
            </button>
            <button
              onClick={onToggle}
              className="flex flex-col items-center gap-0.5 flex-shrink-0"
            >
              <div className="w-9 h-9 rounded grad-btn flex items-center justify-center">
                <Icon name={isPlaying ? "Pause" : "Play"} size={16} className="text-charcoal" />
              </div>
              <span className="text-[8px] text-foreground/25 uppercase tracking-wider leading-none">
                {isPlaying ? "Пауза" : "Играть"}
              </span>
            </button>
            <button onClick={onNext} className="flex flex-col items-center gap-0.5 p-1.5 text-foreground/40 hover:text-foreground transition-colors hidden sm:flex">
              <Icon name="SkipForward" size={17} />
              <span className="text-[8px] uppercase tracking-wider leading-none">Далее</span>
            </button>
          </div>

          {/* Volume */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex flex-col items-center gap-0.5">
              <Icon name="Volume2" size={14} className="text-foreground/30" />
            </div>
            <input
              type="range" min={0} max={100} value={volume}
              onChange={e => setPlayer(p => ({ ...p, volume: Number(e.target.value) }))}
              className="w-20 h-0.5 accent-amber cursor-pointer"
            />
          </div>

          <button onClick={onOpen} className="flex flex-col items-center gap-0.5 text-foreground/30 hover:text-foreground transition-colors">
            <Icon name="ChevronUp" size={18} />
            <span className="text-[8px] uppercase tracking-wider leading-none">Открыть</span>
          </button>
        </div>
      </div>
    </div>
  );
}