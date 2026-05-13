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

export type PageName = "home" | "player" | "upload" | "lyrics" | "admin";

export default function App() {
  const [page, setPage] = useState<PageName>("home");
  const [tracks, setTracks] = useState<Track[]>(DEMO_TRACKS);
  const [player, setPlayer] = useState<PlayerState>({
    currentTrack: DEMO_TRACKS[0],
    isPlaying: false,
    progress: 34,
    volume: 80,
  });
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [messages, setMessages] = useState<Message[]>([]);

  const playTrack = (track: Track) => {
    setPlayer(p => ({ ...p, currentTrack: track, isPlaying: true }));
  };

  const togglePlay = () => setPlayer(p => ({ ...p, isPlaying: !p.isPlaying }));

  const addTracks = (newTracks: Track[]) => {
    setTracks(prev => [...newTracks, ...prev]);
  };

  const handleLike = (id: string) => {
    setLikedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleMessage = (msg: Message) => {
    setMessages(prev => [msg, ...prev]);
  };

  const handleReadMessage = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
  };

  const handleDeleteMessage = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const unreadCount = messages.filter(m => !m.isRead).length;

  return (
    <div className="min-h-screen bg-mesh text-white flex flex-col">
      <Navigation page={page} setPage={setPage} unreadMessages={unreadCount} />

      <main className="flex-1 pb-28">
        {page === "home" && (
          <HomePage
            tracks={tracks}
            onPlay={playTrack}
            setPage={setPage}
            player={player}
            onToggle={togglePlay}
            onLike={handleLike}
            likedIds={likedIds}
            onMessage={handleMessage}
          />
        )}
        {page === "player" && (
          <PlayerPage
            player={player}
            tracks={tracks}
            onPlay={playTrack}
            onToggle={togglePlay}
            setPlayer={setPlayer}
            onLike={handleLike}
            likedIds={likedIds}
          />
        )}
        {page === "upload" && <UploadPage onAdd={addTracks} setPage={setPage} />}
        {page === "lyrics" && <LyricsPage tracks={tracks} currentTrack={player.currentTrack} onPlay={playTrack} />}
        {page === "admin" && (
          <AdminPage
            tracks={tracks}
            setTracks={setTracks}
            messages={messages}
            onReadMessage={handleReadMessage}
            onDeleteMessage={handleDeleteMessage}
          />
        )}
      </main>

      <MiniPlayer player={player} onToggle={togglePlay} onOpen={() => setPage("player")} setPlayer={setPlayer} />
    </div>
  );
}
