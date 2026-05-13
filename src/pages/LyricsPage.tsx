import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Track } from "../types/music";

interface Props {
  tracks: Track[];
  currentTrack: Track | null;
  onPlay: (t: Track) => void;
}

export default function LyricsPage({ tracks, currentTrack, onPlay }: Props) {
  const tracksWithLyrics = tracks.filter(t => t.lyrics);
  const [selected, setSelected] = useState<Track | null>(currentTrack && currentTrack.lyrics ? currentTrack : tracksWithLyrics[0] ?? null);
  const [search, setSearch] = useState("");

  const filtered = tracksWithLyrics.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.artist.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="font-display text-4xl font-bold text-white tracking-wider mb-2">ТЕКСТЫ ПЕСЕН</h1>
        <p className="text-white/40">{tracksWithLyrics.length} треков с текстами</p>
      </div>

      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        {/* Sidebar */}
        <div className="glass-card rounded-3xl p-4">
          <div className="relative mb-4">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-neon-pink/50"
              placeholder="Поиск..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-8 text-white/30 text-sm">Ничего не найдено</div>
          )}

          <div className="space-y-1 max-h-[500px] overflow-y-auto scrollbar-hide">
            {filtered.map(track => (
              <button
                key={track.id}
                onClick={() => setSelected(track)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all
                  ${selected?.id === track.id ? "bg-white/10 neon-border" : "hover:bg-white/5"}`}
              >
                <img src={track.cover} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                <div className="min-w-0">
                  <p className={`text-sm font-semibold truncate ${selected?.id === track.id ? "grad-text font-display" : "text-white"}`}>
                    {track.title}
                  </p>
                  <p className="text-white/40 text-xs truncate">{track.artist}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Lyrics display */}
        <div className="glass-card rounded-3xl p-8 animate-fade-in">
          {selected ? (
            <>
              <div className="flex items-start gap-5 mb-8">
                <div className="relative flex-shrink-0">
                  <img src={selected.cover} alt={selected.title}
                    className="w-20 h-20 rounded-2xl object-cover shadow-xl" />
                  <div className="absolute inset-0 rounded-2xl" style={{ background: "var(--grad-main)", opacity: 0.2 }} />
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-3xl font-bold text-white mb-1">{selected.title}</h2>
                  <p className="text-white/60 text-lg mb-4">{selected.artist}</p>
                  <button
                    onClick={() => onPlay(selected)}
                    className="grad-btn px-5 py-2 rounded-xl text-sm font-display tracking-wider flex items-center gap-2 inline-flex"
                  >
                    <Icon name="Play" size={14} className="text-white" />
                    Слушать
                  </button>
                </div>
              </div>

              <div className="border-t border-white/10 pt-8">
                <pre className="font-body text-white/80 leading-9 text-base whitespace-pre-wrap">
                  {selected.lyrics}
                </pre>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Icon name="FileText" size={48} className="text-white/20 mb-4" />
              <p className="text-white/40">Выбери трек слева, чтобы увидеть текст</p>
              <p className="text-white/20 text-sm mt-2">Тексты добавляются при загрузке трека</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
