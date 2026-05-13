import { useState } from "react";
import HomePage from "./pages/HomePage";
import PlayerPage from "./pages/PlayerPage";
import UploadPage from "./pages/UploadPage";
import LyricsPage from "./pages/LyricsPage";
import AdminPage from "./pages/AdminPage";
import AdminGate from "./components/AdminGate";
import MiniPlayer from "./components/MiniPlayer";
import Navigation from "./components/Navigation";
import RadioPage from "./pages/RadioPage";
import { Track, PlayerState, Message } from "./types/music";
import { DEMO_TRACKS } from "./data/demoTracks";
import { useAudioPlayer } from "./hooks/useAudioPlayer";

export type PageName = "home" | "player" | "upload" | "lyrics" | "admin" | "radio";

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
  const [radioMode, setRadioMode] = useState(false);

  const { seekTo } = useAudioPlayer({ player, tracks, setPlayer });

  // Счётчик прослушиваний
  const incPlays = (id: string, mode: "manual" | "radio") => {
    setTracks(prev => prev.map(t => t.id === id
      ? { ...t,
          plays:      mode === "manual" ? (t.plays ?? 0) + 1 : (t.plays ?? 0),
          radioPlays: mode === "radio"  ? (t.radioPlays ?? 0) + 1 : (t.radioPlays ?? 0),
        }
      : t
    ));
  };

  const playTrack = (track: Track, mode: "manual" | "radio" = "manual") => {
    incPlays(track.id, mode);
    setPlayer(p => ({ ...p, currentTrack: track, isPlaying: true, progress: 0 }));
  };

  const togglePlay = () => setPlayer(p => ({ ...p, isPlaying: !p.isPlaying }));

  const playNext = () => {
    const idx = tracks.findIndex(t => t.id === player.currentTrack?.id);
    const next = tracks[idx + 1] ?? tracks[0];
    playTrack(next, radioMode ? "radio" : "manual");
  };
  const playPrev = () => {
    const idx = tracks.findIndex(t => t.id === player.currentTrack?.id);
    const prev = tracks[idx - 1] ?? tracks[tracks.length - 1];
    playTrack(prev, radioMode ? "radio" : "manual");
  };

  // Радио: сначала приоритетные (priority=true), потом остальные в случайном порядке
  const playRadio = () => {
    setRadioMode(true);
    const priority = tracks.filter(t => t.priority);
    const rest     = tracks.filter(t => !t.priority).sort(() => Math.random() - 0.5);
    const queue    = [...priority.sort(() => Math.random() - 0.5), ...rest];
    playTrack(queue[0], "radio");
  };

  const stopRadio = () => setRadioMode(false);

  // Переключение приоритета (сердечко)
  const togglePriority = (id: string) =>
    setTracks(prev => prev.map(t => t.id === id ? { ...t, priority: !t.priority } : t));

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
            onRadio={playRadio}
            onStopRadio={stopRadio}
            radioMode={radioMode}
            onTogglePriority={togglePriority}
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
        {page === "radio"   && (
          <RadioPage
            tracks={tracks} player={player} setPlayer={setPlayer}
            onPlay={playTrack} onToggle={togglePlay}
            onNext={playNext} onPrev={playPrev} seekTo={seekTo}
          />
        )}
        {page === "admin"   && (
          <AdminGate>
            <AdminPage
              tracks={tracks} setTracks={setTracks}
              messages={messages}
              onReadMessage={handleReadMsg}
              onDeleteMessage={handleDeleteMsg}
              onTogglePriority={togglePriority}
            />
          </AdminGate>
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