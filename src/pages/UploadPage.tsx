import { useState, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { Track } from "../types/music";
import { PageName } from "../App";

interface PendingTrack {
  id: string;
  title: string;
  artist: string;
  cover: string;
  lyrics: string;
  duration: string;
  file?: File;
  coverFile?: File;
  coverPreview?: string;
}

interface Props {
  onAdd: (tracks: Track[]) => void;
  setPage: (p: PageName) => void;
}

const DEFAULT_COVER = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80";

function makePending(file?: File): PendingTrack {
  const name = file?.name.replace(/\.[^.]+$/, "") ?? "";
  const parts = name.split(" - ");
  return {
    id: Math.random().toString(36).slice(2),
    artist: parts.length > 1 ? parts[0] : "",
    title: parts.length > 1 ? parts[1] : name,
    cover: DEFAULT_COVER,
    lyrics: "",
    duration: "0:00",
    file,
  };
}

export default function UploadPage({ onAdd, setPage }: Props) {
  const [pending, setPending] = useState<PendingTrack[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const audioFiles = Array.from(files).filter(f => f.type.startsWith("audio/")).slice(0, 100);
    const newTracks = audioFiles.map(makePending);
    setPending(prev => [...prev, ...newTracks].slice(0, 100));
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const removePending = (id: string) => setPending(prev => prev.filter(t => t.id !== id));

  const updatePending = (id: string, patch: Partial<PendingTrack>) => {
    setPending(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
  };

  const handleCoverUpload = (id: string, file: File) => {
    const url = URL.createObjectURL(file);
    updatePending(id, { coverFile: file, coverPreview: url, cover: url });
  };

  const handleSave = () => {
    const tracks: Track[] = pending.map(t => ({
      id: t.id,
      title: t.title || "Без названия",
      artist: t.artist || "Неизвестен",
      cover: t.cover,
      lyrics: t.lyrics,
      duration: t.duration,
      file: t.file,
    }));
    onAdd(tracks);
    setDone(true);
    setTimeout(() => { setPage("home"); }, 1200);
  };

  const editing = editIdx !== null ? pending[editIdx] : null;

  if (done) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center animate-scale-in">
        <div className="w-20 h-20 rounded-full grad-btn flex items-center justify-center mx-auto mb-6">
          <Icon name="Check" size={36} className="text-white" />
        </div>
        <h2 className="font-display text-3xl font-bold text-white mb-2">Загружено!</h2>
        <p className="text-white/50">Треки добавлены в библиотеку</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="font-display text-4xl font-bold text-white tracking-wider mb-2">ЗАГРУЗКА ТРЕКОВ</h1>
        <p className="text-white/40">Батч до 100 файлов за раз · MP3, WAV, FLAC, AAC</p>
      </div>

      {/* Drop zone */}
      <div
        className={`upload-zone rounded-3xl p-12 text-center cursor-pointer mb-8 transition-all ${dragOver ? "drag-over" : ""}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="audio/*"
          className="hidden"
          onChange={e => addFiles(e.target.files)}
        />
        <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center transition-all ${dragOver ? "grad-btn animate-pulse-glow" : "bg-white/10"}`}>
          <Icon name="Upload" size={32} className="text-white" />
        </div>
        <h3 className="font-display text-2xl font-bold text-white mb-2">
          {dragOver ? "Отпусти файлы!" : "Перетащи аудиофайлы сюда"}
        </h3>
        <p className="text-white/40 text-sm mb-4">или нажми для выбора</p>
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass-card text-white/60 text-sm">
          <Icon name="Info" size={14} />
          До 100 файлов за раз
        </span>
      </div>

      {/* Pending tracks */}
      {pending.length > 0 && (
        <div className="animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-white tracking-wider">
              ТРЕКИ К ЗАГРУЗКЕ ({pending.length})
            </h2>
            <div className="flex gap-3">
              <button onClick={() => setPending([])} className="text-white/40 hover:text-white text-sm transition-colors">
                Очистить всё
              </button>
              <button onClick={handleSave} className="grad-btn px-6 py-2 rounded-xl text-sm font-display tracking-wider">
                Добавить в библиотеку
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {pending.map((track, i) => (
              <div key={track.id} className="glass-card rounded-2xl p-3 flex items-center gap-4">
                {/* Cover */}
                <div className="relative flex-shrink-0 cursor-pointer group"
                  onClick={() => { const inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*"; inp.onchange = (e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) handleCoverUpload(track.id, f); }; inp.click(); }}>
                  <img src={track.coverPreview ?? track.cover} alt=""
                    className="w-12 h-12 rounded-xl object-cover" />
                  <div className="absolute inset-0 rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Icon name="Camera" size={14} className="text-white" />
                  </div>
                </div>

                {/* Fields */}
                <div className="flex-1 grid grid-cols-2 gap-2 min-w-0">
                  <input
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-neon-pink/50"
                    placeholder="Название трека"
                    value={track.title}
                    onChange={e => updatePending(track.id, { title: e.target.value })}
                  />
                  <input
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-neon-pink/50"
                    placeholder="Артист"
                    value={track.artist}
                    onChange={e => updatePending(track.id, { artist: e.target.value })}
                  />
                </div>

                {/* Lyrics btn */}
                <button
                  onClick={() => setEditIdx(i)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-display tracking-wider transition-all ${track.lyrics ? "grad-btn text-white" : "glass-card text-white/40 hover:text-white border border-white/10"}`}
                >
                  {track.lyrics ? "Текст ✓" : "Текст"}
                </button>

                <button onClick={() => removePending(track.id)} className="text-white/20 hover:text-white/60 transition-colors flex-shrink-0">
                  <Icon name="X" size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lyrics editor modal */}
      {editing && editIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-card neon-border rounded-3xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-bold text-white tracking-wider">ТЕКСТ ПЕСНИ</h3>
              <button onClick={() => setEditIdx(null)} className="text-white/40 hover:text-white">
                <Icon name="X" size={20} />
              </button>
            </div>
            <p className="text-white/50 text-sm mb-3">{editing.title} — {editing.artist}</p>
            <textarea
              className="w-full h-56 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-neon-pink/50 resize-none leading-relaxed"
              placeholder="Вставьте текст песни..."
              value={editing.lyrics}
              onChange={e => updatePending(editing.id, { lyrics: e.target.value })}
            />
            <button onClick={() => setEditIdx(null)} className="grad-btn w-full mt-4 py-2.5 rounded-xl font-display tracking-wider">
              Сохранить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
