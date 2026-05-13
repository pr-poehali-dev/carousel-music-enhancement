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
      className={`track-card rounded-2xl p-4 cursor-pointer group animate-fade-in ${isActive ? "neon-border" : ""}`}
      style={{ animationDelay: `${(index ?? 0) * 0.05}s`, opacity: 0 }}
      onClick={() => onPlay(track)}
    >
      <div className="relative mb-3">
        <img
          src={track.cover}
          alt={track.title}
          className="w-full aspect-square rounded-xl object-cover"
        />
        <div className={`absolute inset-0 rounded-xl bg-black/40 flex items-center justify-center transition-opacity duration-200 ${isActive && isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
          {isActive && isPlaying ? (
            <div className="flex items-end gap-[3px] h-8">
              <span className="eq-bar" />
              <span className="eq-bar" />
              <span className="eq-bar" />
              <span className="eq-bar" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full grad-btn flex items-center justify-center">
              <Icon name="Play" size={20} className="text-white ml-1" />
            </div>
          )}
        </div>
        {track.genre && (
          <span className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full bg-black/60 text-white/70 font-body">
            {track.genre}
          </span>
        )}
        {/* Like badge */}
        {onLike && (
          <button
            className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all backdrop-blur-sm
              ${liked ? "bg-neon-pink/30 text-neon-pink" : "bg-black/50 text-white/50 hover:text-white/80 opacity-0 group-hover:opacity-100"}`}
            onClick={e => { e.stopPropagation(); onLike(track.id); }}
          >
            <Icon name="Heart" size={10} className={liked ? "fill-neon-pink" : ""} />
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>
        )}
      </div>

      <div>
        <p className="font-display font-semibold text-white truncate text-sm tracking-wide">{track.title}</p>
        <p className="text-white/50 text-xs truncate mt-0.5">{track.artist}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-white/30 text-xs">{track.duration}</span>
          {likeCount > 0 && (
            <span className={`text-xs flex items-center gap-1 ${liked ? "text-neon-pink" : "text-white/25"}`}>
              <Icon name="Heart" size={10} className={liked ? "fill-neon-pink" : ""} />
              {likeCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
