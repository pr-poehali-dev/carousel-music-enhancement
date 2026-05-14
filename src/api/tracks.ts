import { Track } from "../types/music";
import func2url from "../../backend/func2url.json";

const TRACKS_URL = func2url.tracks;
const UPLOAD_URL = func2url["upload-audio"];

export async function apiListTracks(): Promise<Track[]> {
  const res = await fetch(TRACKS_URL);
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

// Загрузить аудиофайл через бэкенд чанками по 512КБ
export async function apiUploadAudio(trackId: string, file: File, folder?: string): Promise<string> {
  const mime      = file.type || "audio/mpeg";
  const CHUNK     = 64 * 1024; // 64 КБ — безопасный размер для btoa
  const uploadId  = trackId + "_" + Date.now();
  const buffer    = await file.arrayBuffer();
  const total     = Math.ceil(buffer.byteLength / CHUNK);

  for (let i = 0; i < total; i++) {
    const slice = buffer.slice(i * CHUNK, (i + 1) * CHUNK);
    const data = btoa(String.fromCharCode(...new Uint8Array(slice)));

    const res = await fetch(UPLOAD_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "chunk", upload_id: uploadId, chunk_idx: i, total_chunks: total, data }),
    });
    const r = await res.json();
    if (!r.ok) throw new Error(`chunk ${i} failed`);
  }

  // Финализация
  const finalRes = await fetch(UPLOAD_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "finalize", upload_id: uploadId, track_id: trackId, filename: file.name, mime_type: mime, folder, total_chunks: total }),
  });
  const finalData = await finalRes.json();
  if (!finalData.ok) throw new Error(finalData.error ?? "finalize failed");
  return finalData.audio_url;
}

// Загрузить аудио из S3 чанками по 512КБ и вернуть blob URL для плеера
export async function apiLoadAudioBlob(audioUrl: string): Promise<string> {
  const keyMatch = audioUrl.match(/key=(audio\/[^&]+)/);
  if (!keyMatch) return audioUrl;
  const key = keyMatch[1];
  const CHUNK = 512 * 1024;

  const sizeRes  = await fetch(`${TRACKS_URL}?action=audio_size&key=${key}`);
  const sizeData = await sizeRes.json();
  const total: number = sizeData.size ?? 0;
  if (!total) throw new Error("unknown audio size");

  const parts: Uint8Array[] = [];
  let offset = 0;
  while (offset < total) {
    const res  = await fetch(`${TRACKS_URL}?action=stream&key=${key}&offset=${offset}&length=${CHUNK}`);
    const data = await res.json();
    const chunk = Uint8Array.from(atob(data.body ?? ""), c => c.charCodeAt(0));
    parts.push(chunk);
    offset += chunk.length;
    if (chunk.length < CHUNK) break;
  }

  const blob = new Blob(parts, { type: "audio/mpeg" });
  return URL.createObjectURL(blob);
}

export async function apiSaveTracks(tracks: Track[]): Promise<void> {
  await fetch(TRACKS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "save", tracks }),
  });
}

export async function apiIncPlays(id: string, mode: "manual" | "radio"): Promise<void> {
  await fetch(TRACKS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "inc_plays", id, mode }),
  });
}

export async function apiTogglePriority(id: string): Promise<boolean> {
  const res = await fetch(TRACKS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "toggle_priority", id }),
  });
  const data = await res.json();
  return data.priority;
}

export async function apiDeleteTrack(id: string): Promise<void> {
  await fetch(TRACKS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "delete", id }),
  });
}

export async function apiDeleteFolder(folder: string): Promise<void> {
  await fetch(TRACKS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "delete_folder", folder }),
  });
}