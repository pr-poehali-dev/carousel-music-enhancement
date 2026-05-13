import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Track } from "../types/music";

interface Props {
  tracks: Track[];
  setTracks: (fn: (t: Track[]) => Track[]) => void;
}

export default function AdminPage({ tracks, setTracks }: Props) {
  const [search, setSearch] = useState("");
  const [editTrack, setEditTrack] = useState<Track | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = tracks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.artist.toLowerCase().includes(search.toLowerCase())
  );

  const deleteTrack = (id: string) => {
    setTracks(prev => prev.filter(t => t.id !== id));
    setConfirmDelete(null);
  };

  const saveEdit = () => {
    if (!editTrack) return;
    setTracks(prev => prev.map(t => t.id === editTrack.id ? editTrack : t));
    setEditTrack(null);
  };

  const artists = [...new Set(tracks.map(t => t.artist))];
  const genres = [...new Set(tracks.map(t => t.genre).filter(Boolean))];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="font-display text-4xl font-bold text-white tracking-wider mb-2">ПАНЕЛЬ УПРАВЛЕНИЯ</h1>
        <p className="text-white/40">Управление треками библиотеки</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { icon: "Music", label: "Всего треков", val: tracks.length, color: "text-neon-pink" },
          { icon: "Users", label: "Артистов", val: artists.length, color: "text-neon-purple" },
          { icon: "Tag", label: "Жанров", val: genres.length, color: "text-neon-orange" },
          { icon: "FileText", label: "С текстами", val: tracks.filter(t => t.lyrics).length, color: "text-neon-yellow" },
        ].map(s => (
          <div key={s.label} className="glass-card rounded-2xl p-5 animate-fade-in">
            <Icon name={s.icon} fallback="Music" size={24} className={`${s.color} mb-3`} />
            <p className="font-display text-3xl font-bold text-white">{s.val}</p>
            <p className="text-white/40 text-xs uppercase tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search & table */}
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-neon-pink/50"
              placeholder="Поиск по треку или артисту..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <span className="text-white/30 text-sm">{filtered.length} треков</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-xs text-white/30 uppercase tracking-widest pb-3 font-display pr-4">#</th>
                <th className="text-left text-xs text-white/30 uppercase tracking-widest pb-3 font-display pr-4">Трек</th>
                <th className="text-left text-xs text-white/30 uppercase tracking-widest pb-3 font-display pr-4 hidden sm:table-cell">Артист</th>
                <th className="text-left text-xs text-white/30 uppercase tracking-widest pb-3 font-display pr-4 hidden md:table-cell">Жанр</th>
                <th className="text-left text-xs text-white/30 uppercase tracking-widest pb-3 font-display hidden md:table-cell">Текст</th>
                <th className="text-right text-xs text-white/30 uppercase tracking-widest pb-3 font-display">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((track, i) => (
                <tr key={track.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="py-3 pr-4 text-white/30 text-sm">{i + 1}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <img src={track.cover} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                      <span className="text-sm font-semibold text-white truncate max-w-[140px]">{track.title}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-white/60 text-sm hidden sm:table-cell">{track.artist}</td>
                  <td className="py-3 pr-4 hidden md:table-cell">
                    {track.genre && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50">{track.genre}</span>
                    )}
                  </td>
                  <td className="py-3 hidden md:table-cell">
                    {track.lyrics
                      ? <span className="text-xs px-2 py-0.5 rounded-full bg-neon-pink/20 text-neon-pink">Есть</span>
                      : <span className="text-xs text-white/20">—</span>
                    }
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditTrack(track)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                        <Icon name="Pencil" size={14} />
                      </button>
                      <button onClick={() => setConfirmDelete(track.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors">
                        <Icon name="Trash2" size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-white/30">
              <Icon name="SearchX" size={32} className="mx-auto mb-2" />
              <p>Ничего не найдено</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit modal */}
      {editTrack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-card neon-border rounded-3xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-bold text-white tracking-wider">РЕДАКТИРОВАНИЕ</h3>
              <button onClick={() => setEditTrack(null)} className="text-white/40 hover:text-white">
                <Icon name="X" size={20} />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <img src={editTrack.cover} alt="" className="w-16 h-16 rounded-2xl object-cover" />
              <div className="flex-1 space-y-2">
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-neon-pink/50"
                  placeholder="Название"
                  value={editTrack.title}
                  onChange={e => setEditTrack({ ...editTrack, title: e.target.value })}
                />
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-neon-pink/50"
                  placeholder="Артист"
                  value={editTrack.artist}
                  onChange={e => setEditTrack({ ...editTrack, artist: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <input
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-neon-pink/50"
                placeholder="Жанр"
                value={editTrack.genre ?? ""}
                onChange={e => setEditTrack({ ...editTrack, genre: e.target.value })}
              />
              <textarea
                className="w-full h-32 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-neon-pink/50 resize-none"
                placeholder="Текст песни..."
                value={editTrack.lyrics ?? ""}
                onChange={e => setEditTrack({ ...editTrack, lyrics: e.target.value })}
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setEditTrack(null)} className="flex-1 py-2.5 rounded-xl glass-card text-white/60 hover:text-white text-sm font-display tracking-wider border border-white/10 transition-colors">
                Отмена
              </button>
              <button onClick={saveEdit} className="flex-1 py-2.5 rounded-xl grad-btn text-white text-sm font-display tracking-wider">
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-card rounded-3xl p-6 w-full max-w-sm text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <Icon name="Trash2" size={24} className="text-red-400" />
            </div>
            <h3 className="font-display text-xl font-bold text-white mb-2 tracking-wider">УДАЛИТЬ ТРЕК?</h3>
            <p className="text-white/40 text-sm mb-6">Это действие нельзя отменить</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl glass-card text-white/60 hover:text-white text-sm font-display tracking-wider border border-white/10 transition-colors">
                Отмена
              </button>
              <button onClick={() => deleteTrack(confirmDelete)} className="flex-1 py-2.5 rounded-xl bg-red-500/80 hover:bg-red-500 text-white text-sm font-display tracking-wider transition-colors">
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
