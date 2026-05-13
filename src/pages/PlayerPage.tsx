import Icon from "@/components/ui/icon";
import { Track, PlayerState } from "../types/music";

interface Props {
  player: PlayerState;
  tracks: Track[];
  onPlay: (t: Track) => void;
  onToggle: () => void;
  setPlayer: (fn: (p: PlayerState) => PlayerState) => void;
}

export default function PlayerPage({ player, tracks, onPlay, onToggle, setPlayer }: Props) {
  const { currentTrack, isPlaying, progress, volume } = player;

  const currentIdx = tracks.findIndex(t => t.id === currentTrack?.id);
  const playNext = () => { if (currentIdx < tracks.length - 1) onPlay(tracks[currentIdx + 1]); };
  const playPrev = () => { if (currentIdx > 0) onPlay(tracks[currentIdx - 1]); };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        {/* Main player */}
        <div className="animate-fade-in">
          {currentTrack ? (
            <div className="glass-card rounded-3xl overflow-hidden">
              {/* Cover */}
              <div className="relative aspect-[16/9] overflow-hidden">
                <img src={currentTrack.cover} alt={currentTrack.title}
                  className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                {/* Center vinyl */}
                <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${isPlaying ? "animate-spin-slow" : ""}`}>
                  <div className="w-32 h-32 rounded-full border-4 border-white/20 relative overflow-hidden shadow-2xl">
                    <img src={currentTrack.cover} alt="" className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 rounded-full border-[16px] border-black/40" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-white/80" />
                    </div>
                  </div>
                </div>

                {/* Track info overlay */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-white/50 text-xs uppercase tracking-widest font-display">{currentTrack.genre}</p>
                      <h2 className="font-display text-3xl font-bold text-white">{currentTrack.title}</h2>
                      <p className="text-white/70">{currentTrack.artist}</p>
                    </div>
                    <button className="text-white/40 hover:text-neon-pink transition-colors">
                      <Icon name="Heart" size={22} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="p-6">
                {/* Progress */}
                <div className="mb-4">
                  <div className="relative h-2 rounded-full bg-white/10 cursor-pointer group"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const pct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                      setPlayer(p => ({ ...p, progress: pct }));
                    }}
                  >
                    <div className="progress-bar h-full rounded-full relative" style={{ width: `${progress}%` }}>
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity shadow" />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-white/30 mt-1">
                    <span>{Math.floor(progress / 100 * 3)}:{String(Math.floor((progress / 100 * 42) % 60)).padStart(2, "0")}</span>
                    <span>{currentTrack.duration}</span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-center gap-6 mb-6">
                  <button className="text-white/30 hover:text-white transition-colors">
                    <Icon name="Shuffle" size={18} />
                  </button>
                  <button onClick={playPrev} className="text-white/60 hover:text-white transition-colors">
                    <Icon name="SkipBack" size={24} />
                  </button>
                  <button onClick={onToggle}
                    className="w-16 h-16 rounded-full grad-btn flex items-center justify-center animate-pulse-glow">
                    <Icon name={isPlaying ? "Pause" : "Play"} size={28} className="text-white ml-1" />
                  </button>
                  <button onClick={playNext} className="text-white/60 hover:text-white transition-colors">
                    <Icon name="SkipForward" size={24} />
                  </button>
                  <button className="text-white/30 hover:text-white transition-colors">
                    <Icon name="Repeat" size={18} />
                  </button>
                </div>

                {/* Volume */}
                <div className="flex items-center gap-3">
                  <Icon name="Volume1" size={16} className="text-white/40" />
                  <input type="range" min={0} max={100} value={volume}
                    onChange={e => setPlayer(p => ({ ...p, volume: Number(e.target.value) }))}
                    className="flex-1 h-1.5 accent-pink-500 cursor-pointer" />
                  <Icon name="Volume2" size={16} className="text-white/40" />
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-3xl p-16 text-center">
              <Icon name="Music2" size={48} className="text-white/20 mx-auto mb-4" />
              <p className="text-white/40">Выбери трек для воспроизведения</p>
            </div>
          )}
        </div>

        {/* Track list */}
        <div className="glass-card rounded-3xl p-4 h-fit max-h-[600px] overflow-y-auto scrollbar-hide">
          <h3 className="font-display text-lg font-bold text-white px-2 mb-4 tracking-wider">ОЧЕРЕДЬ</h3>
          <div className="space-y-1">
            {tracks.map((track, i) => (
              <div key={track.id}
                onClick={() => onPlay(track)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200
                  ${currentTrack?.id === track.id ? "bg-white/10 neon-border" : "hover:bg-white/5"}`}
              >
                <div className="w-8 text-center flex-shrink-0">
                  {currentTrack?.id === track.id && isPlaying ? (
                    <div className="flex items-end justify-center gap-[2px] h-5">
                      <span className="eq-bar" />
                      <span className="eq-bar" />
                      <span className="eq-bar" />
                    </div>
                  ) : (
                    <span className="text-white/30 text-xs">{i + 1}</span>
                  )}
                </div>
                <img src={track.cover} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${currentTrack?.id === track.id ? "grad-text font-display" : "text-white"}`}>
                    {track.title}
                  </p>
                  <p className="text-white/40 text-xs truncate">{track.artist}</p>
                </div>
                <span className="text-white/30 text-xs flex-shrink-0">{track.duration}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
