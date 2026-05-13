import Icon from "@/components/ui/icon";
import { Track } from "../types/music";

interface Props {
  track: Track;
  onPlay: (t: Track) => void;
  onLike?: (id: string) => void;
  liked?: boolean;
  isActive?: boolean;
  isPlaying?: boolean;
  index?: number;
}

export default function TrackCard({ track, onPlay, onLike, liked, isActive, isPlaying, index }: Props) {
  const likeCount = (track.likes ?? 0) + (liked ? 1 : 0);

  return (
    <div
      className={`track-card rounded-lg p-3 cursor-pointer group animate-fade-in ${isActive ? "neon-border" : ""}`}
      style={{ animationDelay: `${(index ?? 0) * 0.05}s`, opacity: 0 }}
      onClick={() => onPlay(track)}
    >
      <div className="relative mb-2.5">
        <img
          src={track.cover}
          alt={track.title}
          className="w-full aspect-square rounded object-cover"
        />
        {/* Гранж царапины */}
        <div className="absolute inset-0 rounded pointer-events-none"
          style={{ backgroundImage: "repeating-linear-gradient(93deg,transparent,transparent 4px,rgba(255,255,255,0.012) 4px,rgba(255,255,255,0.012) 5px)" }} />

        <div className={`absolute inset-0 rounded bg-black/50 flex items-center justify-center transition-opacity duration-200
          ${isActive && isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
          {isActive && isPlaying ? (
            <div className="flex items-end gap-[3px] h-7">
              <span className="eq-bar" />
              <span className="eq-bar" />
              <span className="eq-bar" />
              <span className="eq-bar" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded grad-btn flex items-center justify-center">
              <Icon name="Play" size={18} className="text-charcoal ml-0.5" />
            </div>
          )}
        </div>

        {track.genre && (
          <span className="absolute top-1.5 left-1.5 text-xs px-1.5 py-px rounded badge-amber font-body">
            {track.genre}
          </span>
        )}

        {onLike && (
          <button
            className={`absolute top-1.5 right-1.5 flex items-center gap-0.5 px-1.5 py-px rounded text-xs transition-all backdrop-blur-sm
              ${liked
                ? "bg-amber/20 text-amber border border-amber/30"
                : "bg-black/50 text-white/40 hover:text-white/70 opacity-0 group-hover:opacity-100 border border-white/10"}`}
            onClick={e => { e.stopPropagation(); onLike(track.id); }}
          >
            <Icon name="Heart" size={10} />
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>
        )}
      </div>

      <div>
        <p className="font-display text-sm text-foreground truncate tracking-wide leading-tight">{track.title}</p>
        <p className="text-foreground/40 text-xs truncate mt-0.5">{track.artist}</p>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-foreground/25 text-xs">{track.duration}</span>
          {likeCount > 0 && (
            <span className={`text-xs flex items-center gap-0.5 ${liked ? "text-amber" : "text-foreground/20"}`}>
              <Icon name="Heart" size={9} />
              {likeCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
