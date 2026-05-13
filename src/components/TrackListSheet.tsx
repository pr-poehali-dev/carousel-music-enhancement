import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { Track } from "../types/music";

interface Props {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlay: (t: Track) => void;
  onLike: (id: string) => void;
  likedIds: Set<string>;
  open: boolean;
  onClose: () => void;
}

export default function TrackListSheet({ tracks, currentTrack, isPlaying, onPlay, onLike, likedIds, open, onClose }: Props) {
  const [search, setSearch] = useState("");

  // Закрытие по Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Блокировка скролла страницы при открытой панели
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const filtered = tracks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.artist.toLowerCase().includes(search.toLowerCase()) ||
    (t.genre ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={`fixed left-0 right-0 bottom-0 z-50 transition-transform duration-400 ease-out ${open ? "translate-y-0" : "translate-y-full"}`}
        style={{ maxHeight: "85vh" }}
      >
        <div className="glass-card border-t border-white/10 rounded-t-3xl flex flex-col h-full" style={{ maxHeight: "85vh" }}>

          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 flex-shrink-0">
            <div>
              <h2 className="font-display text-2xl font-bold text-white tracking-wider">ВСЕ ТРЕКИ</h2>
              <p className="text-white/40 text-xs mt-0.5">{tracks.length} треков в библиотеке</p>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-full glass-card flex items-center justify-center text-white/50 hover:text-white transition-colors">
              <Icon name="X" size={18} />
            </button>
          </div>

          {/* Search */}
          <div className="px-5 pb-3 flex-shrink-0">
            <div className="relative">
              <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-neon-pink/40 transition-colors"
                placeholder="Поиск по названию, артисту, жанру..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  <Icon name="X" size={14} />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto scrollbar-hide px-3 pb-6">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-white/30">
                <Icon name="SearchX" size={32} className="mx-auto mb-2" />
                <p>Ничего не найдено</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filtered.map((track, i) => {
                  const active = currentTrack?.id === track.id;
                  const liked = likedIds.has(track.id);
                  return (
                    <div
                      key={track.id}
                      className={`flex items-center gap-3 px-3 py-3 rounded-2xl cursor-pointer transition-all duration-200 group
                        ${active ? "bg-white/10 neon-border" : "hover:bg-white/5"}`}
                    >
                      {/* Index / EQ */}
                      <div className="w-7 text-center flex-shrink-0">
                        {active && isPlaying ? (
                          <div className="flex items-end justify-center gap-[2px] h-5">
                            <span className="eq-bar" />
                            <span className="eq-bar" />
                            <span className="eq-bar" />
                          </div>
                        ) : (
                          <span className="text-white/25 text-xs">{i + 1}</span>
                        )}
                      </div>

                      {/* Cover */}
                      <div className="relative flex-shrink-0" onClick={() => onPlay(track)}>
                        <img src={track.cover} alt={track.title} className="w-12 h-12 rounded-xl object-cover" />
                        <div className={`absolute inset-0 rounded-xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${active && isPlaying ? "opacity-100" : ""}`}>
                          <Icon name={active && isPlaying ? "Pause" : "Play"} size={16} className="text-white ml-0.5" />
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0" onClick={() => onPlay(track)}>
                        <p className={`text-sm font-semibold truncate ${active ? "grad-text font-display" : "text-white"}`}>
                          {track.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-white/40 text-xs truncate">{track.artist}</p>
                          {track.genre && (
                            <span className="text-xs px-1.5 py-px rounded-full bg-white/10 text-white/40 flex-shrink-0">{track.genre}</span>
                          )}
                        </div>
                      </div>

                      {/* Duration */}
                      <span className="text-white/25 text-xs flex-shrink-0 hidden sm:block">{track.duration}</span>

                      {/* Like */}
                      <button
                        onClick={(e) => { e.stopPropagation(); onLike(track.id); }}
                        className={`flex items-center gap-1 flex-shrink-0 px-2 py-1 rounded-xl transition-all
                          ${liked ? "text-neon-pink" : "text-white/25 hover:text-white/50"}`}
                      >
                        <Icon name={liked ? "Heart" : "Heart"} size={14} className={liked ? "fill-neon-pink" : ""} />
                        <span className="text-xs">{(track.likes ?? 0) + (liked ? 1 : 0)}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
