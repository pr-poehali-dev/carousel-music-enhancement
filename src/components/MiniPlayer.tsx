import Icon from "@/components/ui/icon";
import { PlayerState } from "../types/music";

interface Props {
  player: PlayerState;
  onToggle: () => void;
  onOpen: () => void;
  setPlayer: (fn: (p: PlayerState) => PlayerState) => void;
}

export default function MiniPlayer({ player, onToggle, onOpen, setPlayer }: Props) {
  const { currentTrack, isPlaying, progress, volume } = player;
  if (!currentTrack) return null;

  return (
    <div className="player-bar fixed bottom-0 left-0 right-0 z-50 px-4 py-3">
      <div className="max-w-7xl mx-auto">
        {/* Progress bar */}
        <div className="relative h-1 rounded-full bg-white/10 mb-3 cursor-pointer group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const pct = Math.round((x / rect.width) * 100);
            setPlayer(p => ({ ...p, progress: pct }));
          }}
        >
          <div
            className="progress-bar h-full rounded-full transition-all relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Cover */}
          <button onClick={onOpen} className="relative flex-shrink-0">
            <img
              src={currentTrack.cover}
              alt={currentTrack.title}
              className="w-10 h-10 rounded-lg object-cover"
            />
            {isPlaying && (
              <div className="absolute inset-0 rounded-lg flex items-end justify-center pb-1 gap-[2px]">
                <span className="eq-bar" style={{ height: '8px' }} />
                <span className="eq-bar" style={{ height: '12px' }} />
                <span className="eq-bar" style={{ height: '6px' }} />
                <span className="eq-bar" style={{ height: '10px' }} />
              </div>
            )}
          </button>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-white">{currentTrack.title}</p>
            <p className="text-xs text-white/50 truncate">{currentTrack.artist}</p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button className="text-white/40 hover:text-white transition-colors hidden sm:block">
              <Icon name="SkipBack" size={18} />
            </button>
            <button
              onClick={onToggle}
              className="w-10 h-10 rounded-full grad-btn flex items-center justify-center"
            >
              <Icon name={isPlaying ? "Pause" : "Play"} size={18} className="text-white" />
            </button>
            <button className="text-white/40 hover:text-white transition-colors hidden sm:block">
              <Icon name="SkipForward" size={18} />
            </button>
          </div>

          {/* Volume */}
          <div className="hidden md:flex items-center gap-2">
            <Icon name="Volume2" size={16} className="text-white/40" />
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={e => setPlayer(p => ({ ...p, volume: Number(e.target.value) }))}
              className="w-20 h-1 accent-pink-500 cursor-pointer"
            />
          </div>

          <button onClick={onOpen} className="text-white/40 hover:text-white transition-colors">
            <Icon name="ChevronUp" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
