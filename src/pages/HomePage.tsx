import { useState } from "react";
import Icon from "@/components/ui/icon";
import TrackCard from "../components/TrackCard";
import TrackListSheet from "../components/TrackListSheet";
import MessageForm from "../components/MessageForm";
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

export default function HomePage({ tracks, onPlay, setPage, player, onLike, likedIds, onMessage }: Props) {
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const featured = tracks.slice(0, 5);
  const recent = tracks.slice(0, 6);

  const prev = () => setCarouselIdx(i => (i - 1 + featured.length) % featured.length);
  const next = () => setCarouselIdx(i => (i + 1) % featured.length);
  const feat = featured[carouselIdx];

  if (!feat) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero */}
      <section className="mb-12 animate-fade-in">
        <div className="relative rounded-3xl overflow-hidden min-h-[360px] flex items-end"
          style={{ background: "var(--grad-main)" }}>
          <div className="absolute inset-0">
            <img src={feat.cover} alt={feat.title}
              className="w-full h-full object-cover opacity-30 mix-blend-overlay" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </div>

          <div className="absolute top-6 right-6 flex gap-2">
            <button onClick={prev} className="w-9 h-9 rounded-full glass-card flex items-center justify-center text-white hover:bg-white/20 transition-colors">
              <Icon name="ChevronLeft" size={18} />
            </button>
            <button onClick={next} className="w-9 h-9 rounded-full glass-card flex items-center justify-center text-white hover:bg-white/20 transition-colors">
              <Icon name="ChevronRight" size={18} />
            </button>
          </div>

          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-2">
            {featured.map((_, i) => (
              <button key={i} onClick={() => setCarouselIdx(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === carouselIdx ? "w-6 bg-white" : "w-1.5 bg-white/40"}`}
              />
            ))}
          </div>

          <div className="relative z-10 p-8 flex items-end gap-6 w-full">
            <img src={feat.cover} alt={feat.title}
              className="w-24 h-24 rounded-2xl object-cover shadow-2xl hidden sm:block animate-float flex-shrink-0" />
            <div className="flex-1">
              <p className="text-white/50 text-sm uppercase tracking-widest font-display mb-1">{feat.genre}</p>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-1 leading-tight">{feat.title}</h1>
              <p className="text-white/70 text-lg">{feat.artist}</p>
              <div className="flex gap-3 mt-4 flex-wrap">
                <button onClick={() => onPlay(feat)} className="grad-btn px-6 py-2.5 rounded-xl font-display tracking-wider text-sm flex items-center gap-2">
                  <Icon name="Play" size={16} className="text-white" />
                  Слушать
                </button>
                <button onClick={() => setSheetOpen(true)} className="glass-card px-6 py-2.5 rounded-xl text-white/80 hover:text-white text-sm font-display tracking-wider flex items-center gap-2 transition-colors border border-white/20">
                  <Icon name="List" size={16} />
                  Все треки
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="grid grid-cols-3 gap-4 mb-12">
        {[
          { icon: "Music", label: "Треков", val: tracks.length },
          { icon: "Users", label: "Артистов", val: new Set(tracks.map(t => t.artist)).size },
          { icon: "Heart", label: "Лайков", val: tracks.reduce((s, t) => s + (t.likes ?? 0), 0) },
        ].map(s => (
          <div key={s.label} className="glass-card rounded-2xl p-4 text-center">
            <Icon name={s.icon} fallback="Music" size={22} className="text-neon-pink mx-auto mb-2" />
            <p className="font-display text-2xl font-bold text-white">{s.val}</p>
            <p className="text-white/40 text-xs uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Recent tracks grid */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-white tracking-wider">НОВЫЕ ТРЕКИ</h2>
          <button
            onClick={() => setSheetOpen(true)}
            className="text-white/40 hover:text-white text-sm flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-xl hover:bg-white/5"
          >
            <Icon name="List" size={14} />
            Все треки
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {recent.map((track, i) => (
            <TrackCard
              key={track.id}
              track={track}
              onPlay={onPlay}
              onLike={onLike}
              liked={likedIds.has(track.id)}
              isActive={player.currentTrack?.id === track.id}
              isPlaying={player.isPlaying}
              index={i}
            />
          ))}
        </div>
      </section>

      {/* Message form */}
      <section className="max-w-xl">
        <MessageForm onSend={onMessage} />
      </section>

      {/* All tracks sheet */}
      <TrackListSheet
        tracks={tracks}
        currentTrack={player.currentTrack}
        isPlaying={player.isPlaying}
        onPlay={(t) => { onPlay(t); setSheetOpen(false); }}
        onLike={onLike}
        likedIds={likedIds}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />
    </div>
  );
}
