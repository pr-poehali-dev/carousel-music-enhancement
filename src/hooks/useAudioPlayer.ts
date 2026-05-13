import { useEffect, useRef, useCallback } from "react";
import { PlayerState, Track } from "../types/music";

interface UseAudioPlayerProps {
  player: PlayerState;
  tracks: Track[];
  setPlayer: (fn: (p: PlayerState) => PlayerState) => void;
}

export function useAudioPlayer({ player, tracks, setPlayer }: UseAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastTrackId = useRef<string | null>(null);

  // Создаём Audio один раз
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";

    audio.addEventListener("timeupdate", () => {
      if (!audio.duration) return;
      const pct = Math.round((audio.currentTime / audio.duration) * 100);
      setPlayer(p => ({ ...p, progress: pct }));
    });

    audio.addEventListener("ended", () => {
      // Автоматически переходим к следующему треку
      setPlayer(p => {
        if (!p.currentTrack) return p;
        const idx = tracks.findIndex(t => t.id === p.currentTrack!.id);
        const next = tracks[idx + 1] ?? tracks[0];
        return { ...p, currentTrack: next, isPlaying: true, progress: 0 };
      });
    });

    audio.addEventListener("error", () => {
      // Файл недоступен (демо-треки — URL) — просто визуально играем
    });

    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []); // eslint-disable-line

  // Смена трека
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !player.currentTrack) return;

    const trackChanged = player.currentTrack.id !== lastTrackId.current;

    if (trackChanged) {
      lastTrackId.current = player.currentTrack.id;
      if (player.currentTrack.audioUrl) {
        // Аудио хранится на сервере
        audio.src = player.currentTrack.audioUrl;
      } else if (player.currentTrack.file) {
        // Локальный файл (только что загружен, ещё не на сервере)
        audio.src = URL.createObjectURL(player.currentTrack.file);
      } else {
        // Демо-трек без аудио — визуальный режим
        audio.src = "";
      }
      audio.currentTime = 0;
    }

    if (player.isPlaying) {
      audio.play().catch(() => {/* авто-воспроизведение заблокировано браузером */});
    } else {
      audio.pause();
    }
  }, [player.currentTrack, player.isPlaying]);

  // Синхронизация громкости
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = player.volume / 100;
    }
  }, [player.volume]);

  // Перемотка извне (клик по прогресс-бару)
  const seekTo = useCallback((pct: number) => {
    const audio = audioRef.current;
    if (audio && audio.duration) {
      audio.currentTime = (pct / 100) * audio.duration;
    }
    setPlayer(p => ({ ...p, progress: pct }));
  }, [setPlayer]);

  // Получить текущее время/длительность для отображения
  const getTime = useCallback((): { current: number; duration: number } => {
    const audio = audioRef.current;
    return {
      current:  audio?.currentTime  ?? 0,
      duration: audio?.duration ?? 0,
    };
  }, []);

  return { seekTo, getTime, audioRef };
}