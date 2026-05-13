import { useState, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { Track } from "../types/music";
import { PageName } from "../App";

interface Props {
  onAdd: (tracks: Track[]) => void;
  setPage: (p: PageName) => void;
}

const DEFAULT_COVER = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80";

function parseTrackName(filename: string): { title: string; artist: string } {
  const name = filename.replace(/\.[^.]+$/, "");
  const parts = name.split(/\s*[-–—]\s*/);
  if (parts.length >= 2) return { artist: parts[0].trim(), title: parts.slice(1).join(" - ").trim() };
  return { artist: "", title: name.trim() };
}

export default function UploadPage({ onAdd, setPage }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(0); // кол-во добавленных
  const fileRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setLoading(true);

    const audioFiles = Array.from(files)
      .filter(f => f.type.startsWith("audio/") || /\.(mp3|wav|flac|aac|ogg|m4a)$/i.test(f.name))
      .slice(0, 150);

    const tracks: Track[] = audioFiles.map(f => {
      const { title, artist } = parseTrackName(f.name);
      return {
        id: Math.random().toString(36).slice(2),
        title: title || "Без названия",
        artist: artist || "Неизвестен",
        cover: DEFAULT_COVER,
        duration: "0:00",
        file: f,
      };
    });

    if (tracks.length > 0) {
      onAdd(tracks);
      setDone(tracks.length);
    }
    setLoading(false);
  }, [onAdd]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  if (done > 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center animate-scale-in">
        <div className="w-20 h-20 rounded-full grad-btn flex items-center justify-center mx-auto mb-6">
          <Icon name="Check" size={36} className="text-white" />
        </div>
        <h2 className="font-display text-3xl font-bold text-white mb-2">
          {done} {done === 1 ? "трек" : done < 5 ? "трека" : "треков"} добавлено!
        </h2>
        <p className="text-white/40 mb-8">Они уже размещены по ячейкам кубика</p>
        <button
          onClick={() => setPage("home")}
          className="grad-btn px-8 py-3 rounded-xl font-display tracking-wider text-white"
        >
          На карусель
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-10 animate-fade-in text-center">
        <h1 className="font-display text-4xl font-bold text-white tracking-wider mb-2">ЗАГРУЗКА</h1>
        <p className="text-white/35 text-sm">Добавь треки — они автоматически займут ячейки кубика</p>
        <p className="text-white/20 text-xs mt-1">MP3 · WAV · FLAC · AAC · OGG · до 150 файлов</p>
      </div>

      {/* Drop zone */}
      <div
        className={`rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer
          flex flex-col items-center justify-center gap-5 py-20 px-8 text-center
          ${dragOver
            ? "border-amber bg-amber/10 scale-[1.01]"
            : "border-white/15 hover:border-white/30 hover:bg-white/3"
          }`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="audio/*,.mp3,.wav,.flac,.aac,.ogg,.m4a"
          className="hidden"
          onChange={e => processFiles(e.target.files)}
        />

        {loading ? (
          <>
            <div className="w-16 h-16 rounded-full border-2 border-amber border-t-transparent animate-spin" />
            <p className="font-display text-xl text-white">Обрабатываю...</p>
          </>
        ) : (
          <>
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all
              ${dragOver ? "grad-btn" : "bg-white/8"}`}>
              <Icon name={dragOver ? "FolderOpen" : "Upload"} size={34} className="text-white" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-white mb-1">
                {dragOver ? "Отпусти файлы!" : "Перетащи аудиофайлы сюда"}
              </p>
              <p className="text-white/35 text-sm">или нажми для выбора</p>
            </div>

            {/* Визуализация кубика */}
            <div className="mt-4 flex flex-col items-center gap-2">
              <p className="text-white/20 text-xs uppercase tracking-widest">Треки займут ячейки</p>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: 4,
                width: 120,
                opacity: 0.35,
              }}>
                {Array.from({ length: 25 }, (_, i) => (
                  <div key={i} style={{
                    width: 20, height: 20, borderRadius: 3,
                    background: i === 12 ? "#000" : `hsl(${i * 14}, 60%, 45%)`,
                    border: "1px solid rgba(255,255,255,0.2)",
                  }} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <p className="text-center text-white/15 text-xs mt-6">
        Названия определяются автоматически из имени файла формата «Артист — Трек»
      </p>
    </div>
  );
}
