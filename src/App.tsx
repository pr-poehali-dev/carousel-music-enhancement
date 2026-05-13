import { useState } from "react";
import HomePage from "./pages/HomePage";
import PlayerPage from "./pages/PlayerPage";
import UploadPage from "./pages/UploadPage";
import LyricsPage from "./pages/LyricsPage";
import AdminPage from "./pages/AdminPage";
import MiniPlayer from "./components/MiniPlayer";
import Navigation from "./components/Navigation";
import { Track, PlayerState } from "./types/music";
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

  const playTrack = (track: Track) => {
    setPlayer(p => ({ ...p, currentTrack: track, isPlaying: true }));
  };

  const togglePlay = () => setPlayer(p => ({ ...p, isPlaying: !p.isPlaying }));

  const addTracks = (newTracks: Track[]) => {
    setTracks(prev => [...newTracks, ...prev]);
  };

  return (
    <div className="min-h-screen bg-mesh text-white flex flex-col">
      <Navigation page={page} setPage={setPage} />

      <main className="flex-1 pb-28">
        {page === "home" && <HomePage tracks={tracks} onPlay={playTrack} setPage={setPage} player={player} onToggle={togglePlay} />}
        {page === "player" && <PlayerPage player={player} tracks={tracks} onPlay={playTrack} onToggle={togglePlay} setPlayer={setPlayer} />}
        {page === "upload" && <UploadPage onAdd={addTracks} setPage={setPage} />}
        {page === "lyrics" && <LyricsPage tracks={tracks} currentTrack={player.currentTrack} onPlay={playTrack} />}
        {page === "admin" && <AdminPage tracks={tracks} setTracks={setTracks} />}
      </main>

      <MiniPlayer player={player} onToggle={togglePlay} onOpen={() => setPage("player")} setPlayer={setPlayer} />
    </div>
  );
}
