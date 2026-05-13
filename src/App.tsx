import { useState } from "react";
import HomePage from "./pages/HomePage";
import PlayerPage from "./pages/PlayerPage";
import UploadPage from "./pages/UploadPage";
import LyricsPage from "./pages/LyricsPage";
import AdminPage from "./pages/AdminPage";
import MiniPlayer from "./components/MiniPlayer";
import Navigation from "./components/Navigation";
import { Track, PlayerState, Message } from "./types/music";
import { DEMO_TRACKS } from "./data/demoTracks";
import { useAudioPlayer } from "./hooks/useAudioPlayer";

export type PageName = "home" | "player" | "upload" | "lyrics" | "admin";

export default function App() {
  const [page, setPage]     = useState<PageName>("home");
  const [tracks, setTracks] = useState<Track[]>(DEMO_TRACKS);
  const [player, setPlayer] = useState<PlayerState>({
    currentTrack: DEMO_TRACKS[0],
    isPlaying: false,
    progress: 0,
    volume: 80,
  });
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [messages, setMessages] = useState<Message[]>([]);

  const { seekTo } = useAudioPlayer({ player, tracks, setPlayer });

  const playTrack = (track: Track) =>
    setPlayer(p => ({ ...p, currentTrack: track, isPlaying: true, progress: 0 }));

  const togglePlay = () => setPlayer(p => ({ ...p, isPlaying: !p.isPlaying }));

  const playNext = () => {
    const idx = tracks.findIndex(t => t.id === player.currentTrack?.id);
    const next = tracks[idx + 1] ?? tracks[0];
    playTrack(next);
  };
  const playPrev = () => {
    const idx = tracks.findIndex(t => t.id === player.currentTrack?.id);
    const prev = tracks[idx - 1] ?? tracks[tracks.length - 1];
    playTrack(prev);
  };

  const addTracks = (newTracks: Track[]) =>
    setTracks(prev => [...newTracks, ...prev]);

  const updateLyrics = (id: string, lyrics: string) =>
    setTracks(prev => prev.map(t => t.id === id ? { ...t, lyrics } : t));

  const handleLike = (id: string) => {
    setLikedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleMessage    = (msg: Message) => setMessages(prev => [msg, ...prev]);
  const handleReadMsg    = (id: string)   => setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
  const handleDeleteMsg  = (id: string)   => setMessages(prev => prev.filter(m => m.id !== id));

  const unreadCount = messages.filter(m => !m.isRead).length;

  return (
    <div className="min-h-screen bg-mesh text-foreground flex flex-col">
      <Navigation page={page} setPage={setPage} unreadMessages={unreadCount} />

      <main className="flex-1 pb-28">
        {page === "home" && (
          <HomePage
            tracks={tracks} onPlay={playTrack} setPage={setPage}
            player={player} onToggle={togglePlay}
            onLike={handleLike} likedIds={likedIds}
            onMessage={handleMessage}
          />
        )}
        {page === "player" && (
          <PlayerPage
            player={player} tracks={tracks}
            onPlay={playTrack} onToggle={togglePlay}
            setPlayer={setPlayer} seekTo={seekTo}
            onNext={playNext} onPrev={playPrev}
            onLike={handleLike} likedIds={likedIds}
            onUpdateLyrics={updateLyrics}
          />
        )}
        {page === "upload" && <UploadPage onAdd={addTracks} setPage={setPage} />}
        {page === "lyrics"  && <LyricsPage tracks={tracks} currentTrack={player.currentTrack} onPlay={playTrack} />}
        {page === "admin"   && (
          <AdminPage
            tracks={tracks} setTracks={setTracks}
            messages={messages}
            onReadMessage={handleReadMsg}
            onDeleteMessage={handleDeleteMsg}
          />
        )}
      </main>

      <MiniPlayer
        player={player} onToggle={togglePlay}
        onOpen={() => setPage("player")}
        setPlayer={setPlayer} seekTo={seekTo}
        onNext={playNext} onPrev={playPrev}
      />
    </div>
  );
}