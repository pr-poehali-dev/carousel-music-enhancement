import { useState, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { Track } from "../types/music";
import { PageName } from "../App";
import { apiUploadAudio, apiSaveTracks } from "../api/tracks";

function getFolderName(file: File): string | undefined {
  const rel = (file as File & { webkitRelativePath?: string }).webkitRelativePath;
  if (rel) {
    const parts = rel.split("/");
    if (parts.length >= 2) return parts[0];
  }
  return undefined;
}

interface Props {
  onAdd: (tracks: Track[]) => void;
  setPage: (p: PageName) => void;
}

const DEFAULT_COVER = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80";

function parseTrackName(filename: string): { title: string; artist: string } {
  const name  = filename.replace(/\.[^.]+$/, "");
  const parts = name.split(/\s*[-–—]\s*/);
  if (parts.length >= 2) return { artist: parts[0].trim(), title: parts.slice(1).join(" - ").trim() };
  return { artist: "", title: name.trim() };
}

function plural(n: number) {
  if (n % 10 === 1 && n % 100 !== 11) return "трек";
  if ([2,3,4].includes(n % 10) && ![12,13,14].includes(n % 100)) return "трека";
  return "треков";
}

export default function UploadPage({ onAdd, setPage }: Props) {
  const [dragOver,  setDragOver]  = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState({ done: 0, total: 0 });
  const [error,     setError]     = useState<string | null>(null);
  const [finished,  setFinished]  = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);

    const audioFiles = Array.from(files)
      .filter(f => f.type.startsWith("audio/") || /\.(mp3|wav|flac|aac|ogg|m4a)$/i.test(f.name))
      .slice(0, 50); // лимит 50 за раз — файлы большие

    if (audioFiles.length === 0) {
      setError("Аудиофайлы не найдены. Поддерживаются MP3, WAV, FLAC, AAC, OGG.");
      return;
    }

    setUploading(true);
    setProgress({ done: 0, total: audioFiles.length });

    const tracks: Track[] = [];
    const failed: string[] = [];

    for (let i = 0; i < audioFiles.length; i++) {
      const f = audioFiles[i];
      const { title, artist } = parseTrackName(f.name);
      const id = Math.random().toString(36).slice(2) + Date.now().toString(36);

      const folder = getFolderName(f);
      const track: Track = {
        id,
        title:  title  || "Без названия",
        artist: artist || "Неизвестен",
        cover:  DEFAULT_COVER,
        duration: "0:00",
        folder,
        album: folder,
      };

      try {
        const audioUrl = await apiUploadAudio(id, f);
        track.audioUrl = audioUrl;
      } catch {
        failed.push(f.name);
      }

      tracks.push(track);
      setProgress({ done: i + 1, total: audioFiles.length });
    }

    // Сохраняем в БД и добавляем в библиотеку
    await apiSaveTracks(tracks).catch(() => {});
    onAdd(tracks);
    setUploading(false);
    setFinished(tracks.length);

    if (failed.length > 0) {
      setError(`Не удалось загрузить: ${failed.slice(0, 3).join(", ")}${failed.length > 3 ? ` и ещё ${failed.length - 3}` : ""}`);
    }
  }, [onAdd]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  if (finished > 0 && !uploading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center animate-scale-in">
        <div className="w-20 h-20 rounded-full grad-btn flex items-center justify-center mx-auto mb-6">
          <Icon name="Check" size={36} className="text-white" />
        </div>
        <h2 className="font-display text-3xl font-bold text-white mb-2">
          {finished} {plural(finished)} загружено!
        </h2>
        <p className="text-white/40 mb-2">Музыка сохранена на сервере — играет для всех</p>
        {error && <p className="text-red-400/70 text-xs mb-4">{error}</p>}
        <div className="flex gap-3 justify-center mt-6">
          <button onClick={() => { setFinished(0); setError(null); }}
            className="glass-card px-6 py-3 rounded-xl font-display tracking-wider text-white/60 border border-white/10">
            Ещё треки
          </button>
          <button onClick={() => setPage("home")}
            className="grad-btn px-8 py-3 rounded-xl font-display tracking-wider text-white">
            На карусель
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-10 animate-fade-in text-center">
        <h1 className="font-display text-4xl font-bold text-white tracking-wider mb-2">ЗАГРУЗКА</h1>
        <p className="text-white/35 text-sm">Добавь треки — они сохранятся на сервере и будут слышны всем</p>
        <p className="text-white/20 text-xs mt-1">MP3 · WAV · FLAC · AAC · OGG · до 50 файлов за раз</p>
      </div>

      {/* Drop zone */}
      <div
        className={`rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer
          flex flex-col items-center justify-center gap-5 py-16 px-8 text-center
          ${uploading ? "border-amber/40 cursor-default" : dragOver
            ? "border-amber bg-amber/10 scale-[1.01]"
            : "border-white/15 hover:border-white/30 hover:bg-white/3"
          }`}
        onDragOver={e => { if (!uploading) { e.preventDefault(); setDragOver(true); } }}
        onDragLeave={() => setDragOver(false)}
        onDrop={uploading ? undefined : handleDrop}
        onClick={() => !uploading && fileRef.current?.click()}
      >
        {/* Обычные файлы */}
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="audio/*,.mp3,.wav,.flac,.aac,.ogg,.m4a"
          className="hidden"
          onChange={e => processFiles(e.target.files)}
        />
        {/* Выбор папки */}
        <input
          id="folder-input"
          type="file"
          multiple
          accept="audio/*,.mp3,.wav,.flac,.aac,.ogg,.m4a"
          className="hidden"
          // @ts-expect-error webkitdirectory не в типах
          webkitdirectory=""
          onChange={e => processFiles(e.target.files)}
        />

        {uploading ? (
          <>
            {/* Прогресс загрузки */}
            <div className="w-20 h-20 relative flex items-center justify-center">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                <circle cx="40" cy="40" r="34" fill="none" stroke="#d4900a" strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - progress.done / progress.total)}`}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 0.4s ease" }}
                />
              </svg>
              <span className="font-display text-lg font-bold text-amber">
                {progress.done}/{progress.total}
              </span>
            </div>
            <div>
              <p className="font-display text-xl text-white mb-1">Загружаю на сервер...</p>
              <p className="text-white/35 text-sm">Не закрывай страницу</p>
            </div>
            <div className="w-full max-w-xs bg-white/8 rounded-full h-1.5">
              <div
                className="bg-amber h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(progress.done / progress.total) * 100}%` }}
              />
            </div>
          </>
        ) : (
          <>
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all
              ${dragOver ? "grad-btn" : "bg-white/8"}`}>
              <Icon name={dragOver ? "FolderOpen" : "Upload"} size={34} className="text-white" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-white mb-1">
                {dragOver ? "Отпусти файлы!" : "Перетащи музыку сюда"}
              </p>
              <p className="text-white/35 text-sm">или нажми для выбора с телефона</p>
            </div>

            {/* Мини-кубик */}
            <div className="flex flex-col items-center gap-2 mt-2">
              <p className="text-white/20 text-xs uppercase tracking-widest">Треки займут ячейки кубика</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 3, width: 110, opacity: 0.3 }}>
                {Array.from({ length: 25 }, (_, i) => (
                  <div key={i} style={{
                    width: 18, height: 18, borderRadius: 3,
                    background: i === 12 ? "#000" : `hsl(${i * 14},60%,45%)`,
                    border: "1px solid rgba(255,255,255,0.2)",
                  }} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Кнопка выбора папки */}
      {!uploading && (
        <button
          onClick={() => document.getElementById("folder-input")?.click()}
          className="w-full mt-4 py-3 rounded-2xl glass-card border border-white/10 flex items-center justify-center gap-3 text-white/60 hover:text-white transition-colors"
        >
          <Icon name="FolderOpen" size={18} />
          <span className="font-display tracking-wider text-sm">Выбрать папку с телефона</span>
        </button>
      )}

      {error && !uploading && (
        <p className="text-center text-red-400/60 text-xs mt-4">{error}</p>
      )}

      <p className="text-center text-white/15 text-xs mt-5">
        Имя файла «Артист — Трек.mp3» — название определится автоматически
      </p>
    </div>
  );
}