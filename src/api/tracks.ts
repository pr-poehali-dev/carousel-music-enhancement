import { Track } from "../types/music";
import func2url from "../../backend/func2url.json";

const URL        = func2url.tracks;
const UPLOAD_URL = func2url["upload-audio"];

export async function apiListTracks(): Promise<Track[]> {
  const res = await fetch(URL);
  const data = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data.tracks ?? []).map((t: any) => ({
    id:         t.id,
    title:      t.title,
    artist:     t.artist,
    album:      t.album ?? undefined,
    duration:   t.duration,
    cover:      t.cover,
    genre:      t.genre ?? undefined,
    year:       t.year ?? undefined,
    lyrics:     t.lyrics ?? undefined,
    priority:   t.priority ?? false,
    plays:      t.plays ?? 0,
    radioPlays: t.radio_plays ?? 0,
    audioUrl:   t.audio_url ?? undefined,
    folder:     t.folder ?? undefined,
  }));
}

// Загрузить аудиофайл напрямую в S3 через presigned URL
export async function apiUploadAudio(trackId: string, file: File, folder?: string): Promise<string> {
  const mime = file.type || "audio/mpeg";

  // Шаг 1: получаем presigned URL от сервера
  const presignRes = await fetch(UPLOAD_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action:    "presign",
      track_id:  trackId,
      filename:  file.name,
      mime_type: mime,
      folder,
    }),
  });
  const presignData = await presignRes.json();
  if (!presignData.ok) throw new Error(presignData.error ?? "presign failed");

  // Шаг 2: грузим файл напрямую в S3
  await fetch(presignData.upload_url, {
    method:  "PUT",
    headers: { "Content-Type": mime },
    body:    file,
  });

  // Шаг 3: сообщаем серверу что загрузка завершена
  await fetch(UPLOAD_URL, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({
      action:    "confirm",
      track_id:  trackId,
      audio_url: presignData.audio_url,
      folder,
    }),
  });

  return presignData.audio_url;
}

export async function apiSaveTracks(tracks: Track[]): Promise<void> {
  await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "save", tracks }),
  });
}

export async function apiIncPlays(id: string, mode: "manual" | "radio"): Promise<void> {
  await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "inc_plays", id, mode }),
  });
}

export async function apiTogglePriority(id: string): Promise<boolean> {
  const res = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "toggle_priority", id }),
  });
  const data = await res.json();
  return data.priority;
}

export async function apiDeleteTrack(id: string): Promise<void> {
  await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "delete", id }),
  });
}

export async function apiDeleteFolder(folder: string): Promise<void> {
  await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "delete_folder", folder }),
  });
}