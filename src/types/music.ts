export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: string;
  cover: string;
  genre?: string;
  year?: number;
  lyrics?: string;
  file?: File;
  likes?: number;
}

export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  volume: number;
}

export interface Message {
  id: string;
  name: string;
  text: string;
  createdAt: string;
  isRead: boolean;
}
