import { useState } from "react";
import RubiksCube from "../components/RubiksCube";
import Icon from "@/components/ui/icon";
import { Track, PlayerState, Message } from "../types/music";
import { PageName } from "../App";

interface Props {
  tracks: Track[];
  onPlay: (t: Track, mode?: "manual" | "radio") => void;
  onRadio: () => void;
  onStopRadio: () => void;
  radioMode: boolean;
  onTogglePriority: (id: string) => void;
  setPage: (p: PageName) => void;
  player: PlayerState;
  onToggle: () => void;
  onLike: (id: string) => void;
  likedIds: Set<string>;
  onMessage: (msg: Message) => void;
}

export default function HomePage({
  tracks, onPlay, onRadio, onStopRadio, radioMode, onTogglePriority,
  setPage, player, onToggle,
}: Props) {
  const [hint, setHint] = useState(true);
  const cur = player.currentTrack;

  const handleTrackClick = (track: Track) => {
    if (radioMode) onStopRadio();
    onPlay(track, "manual");
  };

  return (
    <div className="flex flex-col items-center min-h-full pt-6 pb-32 px-4 select-none">
      <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-[0.15em] text-white mb-1">
        МУЗЫКАЛЬНАЯ КАРУСЕЛЬ
      </h1>
      <p className="text-white/30 text-xs uppercase tracking-widest mb-6 font-body">
        Крути · Касайся · Слушай
      </p>

      {hint && (
        <div className="mb-5 glass-card px-4 py-3 rounded-2xl flex items-center gap-3 max-w-sm w-full">
          <Icon name="Info" size={15} className="text-amber flex-shrink-0" />
          <p className="text-white/55 text-xs leading-relaxed flex-1">
            Тапни обложку — играет трек. 📻 в центре — радио. ♥ — приоритет в радио
          </p>
          <button onClick={() => setHint(false)} className="text-white/25 hover:text-white/60">
            <Icon name="X" size={13} />
          </button>
        </div>
      )}

      <RubiksCube
        tracks={tracks}
        player={player}
        onPlay={handleTrackClick}
        onRadio={onRadio}
        radioMode={radioMode}
        onTogglePriority={onTogglePriority}
      />

      {cur && (
        <div className="mt-7 glass-card rounded-2xl px-4 py-3 flex items-center gap-3 max-w-sm w-full">
          <img src={cur.cover} alt={cur.title} className="w-11 h-11 rounded-xl object-cover flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-white font-display text-sm font-bold truncate">{cur.title}</p>
              {radioMode && (
                <span className="text-[10px] text-amber uppercase tracking-wider flex-shrink-0">радио</span>
              )}
            </div>
            <p className="text-white/40 text-xs truncate">{cur.artist}</p>
          </div>
          {/* Сердечко — приоритет в радио */}
          <button
            onClick={() => onTogglePriority(cur.id)}
            className="flex-shrink-0 flex flex-col items-center gap-0.5 transition-transform active:scale-125"
          >
            <span style={{ fontSize: 20, lineHeight: 1 }}>
              {cur.priority ? "❤️" : "🤍"}
            </span>
            <span className={`text-[9px] uppercase tracking-wider leading-none ${cur.priority ? "text-red-400" : "text-white/30"}`}>
              {cur.priority ? "Кайфую" : "Кайфую?"}
            </span>
          </button>
          <button
            onClick={onToggle}
            className="flex flex-col items-center gap-0.5 w-9 flex-shrink-0"
          >
            <div className="w-9 h-9 rounded-full grad-btn flex items-center justify-center">
              <Icon name={player.isPlaying ? "Pause" : "Play"} size={16} className="text-white" />
            </div>
            <span className="text-[9px] text-white/25 uppercase tracking-wider leading-none">
              {player.isPlaying ? "Пауза" : "Играть"}
            </span>
          </button>
          <button
            onClick={() => setPage("player")}
            className="flex flex-col items-center gap-0.5 flex-shrink-0"
          >
            <div className="w-9 h-9 rounded-full glass-card flex items-center justify-center border border-white/10">
              <Icon name="Maximize2" size={14} className="text-white/55" />
            </div>
            <span className="text-[9px] text-white/25 uppercase tracking-wider leading-none">Плеер</span>
          </button>
        </div>
      )}
    </div>
  );
}