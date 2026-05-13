import Icon from "@/components/ui/icon";
import { Track, PlayerState } from "../types/music";

interface Props {
  player: PlayerState;
  tracks: Track[];
  onPlay: (t: Track) => void;
  onToggle: () => void;
  setPlayer: (fn: (p: PlayerState) => PlayerState) => void;
  seekTo: (pct: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onLike: (id: string) => void;
  likedIds: Set<string>;
}

function formatTime(sec: number): string {
  if (!sec || isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function PlayerPage({ player, tracks, onPlay, onToggle, setPlayer, seekTo, onNext, onPrev, onLike, likedIds }: Props) {
  const { currentTrack, isPlaying, progress, volume } = player;
  const liked = currentTrack ? likedIds.has(currentTrack.id) : false;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    seekTo(Math.max(0, Math.min(100, pct)));
  };

  // Примерное время для демо-треков без реального файла
  const parseDuration = (dur: string): number => {
    const [m, s] = dur.split(":").map(Number);
    return (m || 0) * 60 + (s || 0);
  };
  const durationSec = currentTrack ? parseDuration(currentTrack.duration) : 0;
  const currentSec  = durationSec * (progress / 100);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-[1fr_340px] gap-8">

        {/* ── Main player ─────────────────────────────── */}
        <div className="animate-fade-in">
          {currentTrack ? (
            <div className="glass-card rounded-xl overflow-hidden">
              {/* Cover с виниловым диском */}
              <div className="relative aspect-[16/9] overflow-hidden">
                <img src={currentTrack.cover} alt={currentTrack.title}
                  className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10" />
                {/* царапины */}
                <div className="absolute inset-0 scratch-overlay pointer-events-none" />

                {/* Виниловый диск */}
                <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${isPlaying ? "animate-spin-slow" : ""}`}>
                  <div className="w-28 h-28 rounded-full relative shadow-2xl" style={{ background: "#111" }}>
                    <img src={currentTrack.cover} alt="" className="absolute inset-2 rounded-full object-cover opacity-50" />
                    {/* Канавки */}
                    {[28, 34, 40, 46].map(r => (
                      <div key={r} className="absolute rounded-full border border-white/5"
                        style={{ inset: `${r}px` }} />
                    ))}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-5 h-5 rounded-full bg-amber/80 border-2 border-black/40" />
                    </div>
                    {/* Радужный отлив */}
                    <div className="absolute inset-0 rounded-full"
                      style={{ background: "conic-gradient(from 0deg, transparent 0%, rgba(212,144,10,0.08) 25%, transparent 50%, rgba(184,74,42,0.06) 75%, transparent 100%)" }} />
                  </div>
                </div>

                {/* Инфо */}
                <div className="absolute bottom-5 left-6 right-6">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      {currentTrack.genre && (
                        <span className="badge-amber text-xs px-2 py-0.5 rounded font-display tracking-widest mb-2 inline-block">
                          {currentTrack.genre}
                        </span>
                      )}
                      <h2 className="font-display text-4xl text-white leading-none">{currentTrack.title}</h2>
                      <p className="text-white/60 mt-1 text-sm">{currentTrack.artist}{currentTrack.album ? ` · ${currentTrack.album}` : ""}</p>
                    </div>
                    <button
                      onClick={() => onLike(currentTrack.id)}
                      className={`flex-shrink-0 flex items-center gap-1.5 transition-all px-3 py-1.5 rounded
                        ${liked ? "text-amber bg-amber/10 border border-amber/30" : "text-white/30 hover:text-white/60 border border-white/10"}`}
                    >
                      <Icon name="Heart" size={16} />
                      <span className="text-sm font-display">{(currentTrack.likes ?? 0) + (liked ? 1 : 0)}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="p-5">
                {/* Progress */}
                <div className="mb-4">
                  <div
                    className="relative h-1.5 rounded-full bg-white/10 cursor-pointer group mb-1"
                    onClick={handleSeek}
                  >
                    <div className="progress-bar h-full rounded-full relative transition-none" style={{ width: `${progress}%` }}>
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-amber opacity-0 group-hover:opacity-100 transition-opacity shadow" />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-white/25">
                    <span>{formatTime(currentSec)}</span>
                    <span>{currentTrack.duration}</span>
                  </div>
                </div>

                {/* Кнопки */}
                <div className="flex items-center justify-center gap-8 mb-5">
                  <button className="text-white/25 hover:text-white/60 transition-colors">
                    <Icon name="Shuffle" size={17} />
                  </button>
                  <button onClick={onPrev} className="text-white/50 hover:text-white transition-colors">
                    <Icon name="SkipBack" size={22} />
                  </button>
                  <button
                    onClick={onToggle}
                    className="w-14 h-14 rounded grad-btn flex items-center justify-center animate-pulse-glow"
                  >
                    <Icon name={isPlaying ? "Pause" : "Play"} size={26} className="text-charcoal" />
                  </button>
                  <button onClick={onNext} className="text-white/50 hover:text-white transition-colors">
                    <Icon name="SkipForward" size={22} />
                  </button>
                  <button className="text-white/25 hover:text-white/60 transition-colors">
                    <Icon name="Repeat" size={17} />
                  </button>
                </div>

                {/* Громкость */}
                <div className="flex items-center gap-3">
                  <Icon name="Volume1" size={14} className="text-white/30" />
                  <input
                    type="range" min={0} max={100} value={volume}
                    onChange={e => setPlayer(p => ({ ...p, volume: Number(e.target.value) }))}
                    className="flex-1 h-1 accent-amber cursor-pointer"
                  />
                  <Icon name="Volume2" size={14} className="text-white/30" />
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-xl p-16 text-center">
              <Icon name="Music2" size={48} className="text-white/10 mx-auto mb-4" />
              <p className="text-white/30">Выбери трек для воспроизведения</p>
            </div>
          )}
        </div>

        {/* ── Очередь ─────────────────────────────────── */}
        <div className="glass-card rounded-xl p-3 h-fit max-h-[580px] overflow-y-auto scrollbar-hide">
          <h3 className="font-display text-base text-foreground/50 px-2 pt-1 pb-3 tracking-widest">ОЧЕРЕДЬ</h3>
          <div className="space-y-0.5">
            {tracks.map((track, i) => {
              const active = currentTrack?.id === track.id;
              return (
                <div
                  key={track.id}
                  onClick={() => onPlay(track)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150
                    ${active ? "bg-amber/8 neon-border" : "hover:bg-white/4"}`}
                >
                  <div className="w-6 text-center flex-shrink-0">
                    {active && isPlaying ? (
                      <div className="flex items-end justify-center gap-[2px] h-4">
                        <span className="eq-bar" />
                        <span className="eq-bar" />
                        <span className="eq-bar" />
                      </div>
                    ) : (
                      <span className="text-white/20 text-xs">{i + 1}</span>
                    )}
                  </div>
                  <img src={track.cover} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold truncate ${active ? "grad-text font-display" : "text-foreground/80"}`}>
                      {track.title}
                    </p>
                    <p className="text-white/30 text-xs truncate">{track.artist}</p>
                  </div>
                  <span className="text-white/20 text-xs flex-shrink-0">{track.duration}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
