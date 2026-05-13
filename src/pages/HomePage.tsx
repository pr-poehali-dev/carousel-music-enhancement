import { useState } from "react";
import RubiksCube from "../components/RubiksCube";
import Icon from "@/components/ui/icon";
import { Track, PlayerState, Message } from "../types/music";
import { PageName } from "../App";

interface Props {
  tracks: Track[];
  onPlay: (t: Track) => void;
  setPage: (p: PageName) => void;
  player: PlayerState;
  onToggle: () => void;
  onLike: (id: string) => void;
  likedIds: Set<string>;
  onMessage: (msg: Message) => void;
}

export default function HomePage({ tracks, onPlay, setPage, player, onToggle }: Props) {
  const [hint, setHint] = useState(true);

  const cur = player.currentTrack;

  return (
    <div className="flex flex-col items-center min-h-full pt-6 pb-32 px-4 select-none">
      <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-[0.15em] text-white mb-1">
        МУЗЫКАЛЬНАЯ КАРУСЕЛЬ
      </h1>
      <p className="text-white/30 text-xs uppercase tracking-widest mb-8 font-body">
        Крути · Касайся · Слушай
      </p>

      {hint && (
        <div className="mb-6 glass-card px-5 py-3 rounded-2xl flex items-center gap-3 max-w-sm w-full">
          <Icon name="Info" size={16} className="text-amber flex-shrink-0" />
          <p className="text-white/60 text-xs leading-relaxed flex-1">
            Кубик крутится сам — тапни по обложке чтобы включить трек
          </p>
          <button onClick={() => setHint(false)} className="text-white/30 hover:text-white/60">
            <Icon name="X" size={14} />
          </button>
        </div>
      )}

      <RubiksCube tracks={tracks} player={player} onPlay={onPlay} />

      {cur && (
        <div className="mt-8 glass-card rounded-2xl px-5 py-4 flex items-center gap-4 max-w-sm w-full">
          <img src={cur.cover} alt={cur.title} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-white font-display text-sm font-bold truncate">{cur.title}</p>
            <p className="text-white/40 text-xs truncate">{cur.artist}</p>
          </div>
          <button
            onClick={onToggle}
            className="w-10 h-10 rounded-full grad-btn flex items-center justify-center flex-shrink-0"
          >
            <Icon name={player.isPlaying ? "Pause" : "Play"} size={18} className="text-white" />
          </button>
          <button
            onClick={() => setPage("player")}
            className="w-10 h-10 rounded-full glass-card flex items-center justify-center flex-shrink-0 border border-white/10"
          >
            <Icon name="Maximize2" size={15} className="text-white/60" />
          </button>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => setPage("radio" as PageName)}
          className="glass-card px-5 py-2.5 rounded-xl text-white/70 hover:text-white text-sm font-display tracking-wider flex items-center gap-2 transition-colors border border-white/10"
        >
          <Icon name="Radio" size={15} />
          Радио
        </button>
        <button
          onClick={() => setPage("player")}
          className="glass-card px-5 py-2.5 rounded-xl text-white/70 hover:text-white text-sm font-display tracking-wider flex items-center gap-2 transition-colors border border-white/10"
        >
          <Icon name="Disc3" size={15} />
          Плеер
        </button>
      </div>
    </div>
  );
}