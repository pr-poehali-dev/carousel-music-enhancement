import { useEffect, useRef, useCallback } from "react";
import { PlayerState, Track } from "../types/music";

interface UseAudioPlayerProps {
  player: PlayerState;
  tracks: Track[];
  setPlayer: (fn: (p: PlayerState) => PlayerState) => void;
}

export function useAudioPlayer({ player, tracks, setPlayer }: UseAudioPlayerProps) {
  const audioRef    = useRef<HTMLAudioElement | null>(null);
  const lastTrackId = useRef<string | null>(null);
  const isPlayingRef = useRef(false);

  // Создаём Audio один раз
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";

    audio.addEventListener("timeupdate", () => {
      if (!audio.duration) return;
      const pct = Math.round((audio.currentTime / audio.duration) * 100);
      setPlayer(p => ({ ...p, progress: pct }));
    });

    audio.addEventListener("ended", () => {
      setPlayer(p => {
        if (!p.currentTrack) return p;
        const idx  = tracks.findIndex(t => t.id === p.currentTrack!.id);
        const next = tracks[idx + 1] ?? tracks[0];
        return { ...p, currentTrack: next, isPlaying: true, progress: 0 };
      });
    });

    // Когда трек загрузился — играем если нужно
    audio.addEventListener("canplay", () => {
      if (isPlayingRef.current) {
        audio.play().catch(() => {});
      }
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

    isPlayingRef.current = player.isPlaying;
    const trackChanged = player.currentTrack.id !== lastTrackId.current;

    if (trackChanged) {
      lastTrackId.current = player.currentTrack.id;
      audio.pause();

      if (player.currentTrack.audioUrl) {
        audio.src = player.currentTrack.audioUrl;
        audio.load();
        // play запустится через canplay
      } else if (player.currentTrack.file) {
        audio.src = URL.createObjectURL(player.currentTrack.file);
        audio.load();
      } else {
        audio.src = "";
      }
      audio.currentTime = 0;
    } else {
      // Трек тот же — просто пауза/плей
      if (player.isPlaying) {
        audio.play().catch(() => {});
      } else {
        audio.pause();
      }
    }
  }, [player.currentTrack?.id, player.isPlaying]); // eslint-disable-line

  // Громкость
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = player.volume / 100;
    }
  }, [player.volume]);

  const seekTo = useCallback((pct: number) => {
    const audio = audioRef.current;
    if (audio && audio.duration) {
      audio.currentTime = (pct / 100) * audio.duration;
    }
    setPlayer(p => ({ ...p, progress: pct }));
  }, [setPlayer]);

  const getTime = useCallback((): { current: number; duration: number } => {
    const audio = audioRef.current;
    return {
      current:  audio?.currentTime ?? 0,
      duration: audio?.duration    ?? 0,
    };
  }, []);

  return { seekTo, getTime, audioRef };
}
