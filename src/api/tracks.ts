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

// Загрузить аудиофайл через бэкенд чанками по 512КБ
export async function apiUploadAudio(trackId: string, file: File, folder?: string): Promise<string> {
  const mime      = file.type || "audio/mpeg";
  const CHUNK     = 512 * 1024; // 512 КБ
  const uploadId  = trackId + "_" + Date.now();
  const buffer    = await file.arrayBuffer();
  const total     = Math.ceil(buffer.byteLength / CHUNK);

  for (let i = 0; i < total; i++) {
    const slice = buffer.slice(i * CHUNK, (i + 1) * CHUNK);
    const bytes = new Uint8Array(slice);
    let bin = "";
    for (let j = 0; j < bytes.byteLength; j++) bin += String.fromCharCode(bytes[j]);
    const data = btoa(bin);

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