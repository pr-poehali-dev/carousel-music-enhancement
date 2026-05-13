import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Track, Message } from "../types/music";

interface Props {
  tracks: Track[];
  setTracks: (fn: (t: Track[]) => Track[]) => void;
  messages: Message[];
  onReadMessage: (id: string) => void;
  onDeleteMessage: (id: string) => void;
  onTogglePriority: (id: string) => void;
}

type Tab = "tracks" | "messages";

export default function AdminPage({ tracks, setTracks, messages, onReadMessage, onDeleteMessage, onTogglePriority }: Props) {
  const [tab, setTab] = useState<Tab>("tracks");
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
  const unreadCount = messages.filter(m => !m.isRead).length;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="font-display text-4xl font-bold text-white tracking-wider mb-2">ПАНЕЛЬ УПРАВЛЕНИЯ</h1>
        <p className="text-white/40">Управление треками и сообщениями</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { icon: "Music",         label: "Всего треков",  val: tracks.length, color: "text-neon-pink" },
          { icon: "Users",         label: "Артистов",      val: artists.length, color: "text-neon-purple" },
          { icon: "Headphones",    label: "Прослушано",    val: tracks.reduce((s,t) => s + (t.plays ?? 0), 0), color: "text-neon-orange" },
          { icon: "Radio",         label: "В радио",       val: tracks.reduce((s,t) => s + (t.radioPlays ?? 0), 0), color: "text-neon-yellow", badge: unreadCount },
        ].map(s => (
          <div key={s.label} className="glass-card rounded-2xl p-5 animate-fade-in relative">
            <Icon name={s.icon} fallback="Music" size={24} className={`${s.color} mb-3`} />
            <p className="font-display text-3xl font-bold text-white">{s.val}</p>
            <p className="text-white/40 text-xs uppercase tracking-wider mt-1">{s.label}</p>
            {"badge" in s && s.badge > 0 && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full grad-btn flex items-center justify-center">
                <span className="text-white text-xs font-bold">{s.badge}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {([
          { id: "tracks" as Tab, label: "Треки", icon: "Music" },
          { id: "messages" as Tab, label: "Сообщения", icon: "MessageCircle", badge: unreadCount },
        ]).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-display tracking-wider text-sm transition-all relative
              ${tab === t.id ? "grad-btn text-white" : "glass-card text-white/50 hover:text-white border border-white/10"}`}
          >
            <Icon name={t.icon} fallback="Music" size={15} />
            {t.label}
            {"badge" in t && t.badge > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-neon-pink flex items-center justify-center text-white text-xs font-bold">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TRACKS TAB */}
      {tab === "tracks" && (
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
                  <th className="text-left text-xs text-white/30 uppercase tracking-widest pb-3 font-display pr-4 hidden md:table-cell">▶ Ручн.</th>
                  <th className="text-left text-xs text-white/30 uppercase tracking-widest pb-3 font-display pr-4 hidden md:table-cell">📻 Радио</th>
                  <th className="text-left text-xs text-white/30 uppercase tracking-widest pb-3 font-display hidden md:table-cell">♥</th>
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
                    <td className="py-3 pr-4 hidden md:table-cell text-white/60 text-sm">
                      {track.plays ? <span className="flex items-center gap-1"><Icon name="Headphones" size={11} className="text-amber" />{track.plays}</span> : <span className="text-white/20">—</span>}
                    </td>
                    <td className="py-3 pr-4 hidden md:table-cell text-white/60 text-sm">
                      {track.radioPlays ? <span className="flex items-center gap-1"><Icon name="Radio" size={11} className="text-neon-blue" />{track.radioPlays}</span> : <span className="text-white/20">—</span>}
                    </td>
                    <td className="py-3 hidden md:table-cell">
                      <button onClick={() => onTogglePriority(track.id)} className="text-lg transition-transform active:scale-125">
                        {track.priority ? "❤️" : "🤍"}
                      </button>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setEditTrack(track)}
                          className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-white active:bg-white/10 transition-colors">
                          <Icon name="Pencil" size={15} />
                        </button>
                        <button onClick={() => setConfirmDelete(track.id)}
                          className="p-2 rounded-lg bg-red-500/10 text-red-400/60 hover:text-red-400 active:bg-red-500/20 transition-colors">
                          <Icon name="Trash2" size={15} />
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
      )}

      {/* MESSAGES TAB */}
      {tab === "messages" && (
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="glass-card rounded-3xl p-16 text-center text-white/30">
              <Icon name="MessageCircle" size={40} className="mx-auto mb-3" />
              <p>Пока нет сообщений</p>
              <p className="text-sm mt-1 text-white/20">Они появятся, когда посетители напишут вам с главной страницы</p>
            </div>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                className={`glass-card rounded-2xl p-5 transition-all ${!msg.isRead ? "neon-border" : "border border-white/5"}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-display font-bold text-sm
                      ${!msg.isRead ? "grad-btn text-white" : "bg-white/10 text-white/50"}`}>
                      {msg.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white text-sm">{msg.name}</span>
                        {!msg.isRead && (
                          <span className="text-xs px-2 py-px rounded-full bg-neon-pink/20 text-neon-pink font-display tracking-wider">НОВОЕ</span>
                        )}
                        <span className="text-white/25 text-xs ml-auto flex-shrink-0">{formatDate(msg.createdAt)}</span>
                      </div>
                      <p className="text-white/70 text-sm leading-relaxed">{msg.text}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!msg.isRead && (
                      <button
                        onClick={() => onReadMessage(msg.id)}
                        className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-green-400 transition-colors"
                        title="Отметить прочитанным"
                      >
                        <Icon name="CheckCheck" size={15} />
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteMessage(msg.id)}
                      className="p-2 rounded-xl hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                      title="Удалить"
                    >
                      <Icon name="Trash2" size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

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