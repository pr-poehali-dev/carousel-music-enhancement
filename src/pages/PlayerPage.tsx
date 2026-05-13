import Icon from "@/components/ui/icon";
import VinylDisk from "../components/VinylDisk";
import LyricsScroller from "../components/LyricsScroller";
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

export default function PlayerPage({
  player, tracks, onPlay, onToggle, setPlayer,
  seekTo, onNext, onPrev, onLike, likedIds,
}: Props) {
  const { currentTrack, isPlaying, progress, volume } = player;
  const liked = currentTrack ? likedIds.has(currentTrack.id) : false;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    seekTo(Math.max(0, Math.min(100, pct)));
  };

  const parseDuration = (dur: string): number => {
    const [m, s] = dur.split(":").map(Number);
    return (m || 0) * 60 + (s || 0);
  };
  const durationSec = currentTrack ? parseDuration(currentTrack.duration) : 0;
  const currentSec  = durationSec * (progress / 100);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">

        {/* ── ГЛАВНАЯ ПАНЕЛЬ ─────────────────────────── */}
        <div className="animate-fade-in space-y-4">
          {currentTrack ? (
            <>
              {/* Vinyl + Info */}
              <div className="glass-card rounded-xl overflow-hidden">
                {/* Верхняя часть: размытый фон обложки */}
                <div className="relative overflow-hidden" style={{ minHeight: 300 }}>
                  {/* Размытый фон */}
                  <img
                    src={currentTrack.cover}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover scale-110"
                    style={{ filter: "blur(28px) brightness(0.25) saturate(0.6)" }}
                  />
                  {/* Царапины */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage: "repeating-linear-gradient(97deg,transparent,transparent 5px,rgba(255,255,255,0.008) 5px,rgba(255,255,255,0.008) 6px)",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />

                  {/* Виниловый диск по центру */}
                  <div className="relative z-10 flex items-center justify-center py-8">
                    <VinylDisk cover={currentTrack.cover} isPlaying={isPlaying} size={220} />
                  </div>

                  {/* Инфо снизу */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        {currentTrack.genre && (
                          <span className="badge-amber text-xs px-2 py-0.5 rounded font-display tracking-widest mb-2 inline-block">
                            {currentTrack.genre}
                          </span>
                        )}
                        <h2 className="font-display text-4xl sm:text-5xl text-white leading-none drop-shadow-lg">
                          {currentTrack.title}
                        </h2>
                        <p className="text-white/55 mt-1.5 text-sm">
                          {currentTrack.artist}
                          {currentTrack.album ? ` · ${currentTrack.album}` : ""}
                          {currentTrack.year ? ` · ${currentTrack.year}` : ""}
                        </p>
                      </div>
                      <button
                        onClick={() => onLike(currentTrack.id)}
                        className={`flex-shrink-0 flex items-center gap-1.5 transition-all px-3 py-1.5 rounded border
                          ${liked
                            ? "text-amber bg-amber/10 border-amber/40"
                            : "text-white/30 hover:text-white/60 border-white/10"
                          }`}
                      >
                        <Icon name="Heart" size={15} />
                        <span className="text-sm font-display">
                          {(currentTrack.likes ?? 0) + (liked ? 1 : 0)}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="p-5">
                  {/* Progress bar */}
                  <div className="mb-5">
                    <div
                      className="relative h-1 rounded-full bg-white/10 cursor-pointer group mb-1.5"
                      onClick={handleSeek}
                    >
                      <div
                        className="progress-bar h-full rounded-full relative"
                        style={{ width: `${progress}%`, transition: "width 0.3s linear" }}
                      >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-amber opacity-0 group-hover:opacity-100 transition-opacity shadow" />
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-white/25">
                      <span>{formatTime(currentSec)}</span>
                      <span>{currentTrack.duration}</span>
                    </div>
                  </div>

                  {/* Кнопки управления */}
                  <div className="flex items-center justify-center gap-7 mb-5">
                    <button className="text-white/20 hover:text-white/50 transition-colors">
                      <Icon name="Shuffle" size={16} />
                    </button>
                    <button
                      onClick={onPrev}
                      className="text-white/50 hover:text-white transition-colors"
                    >
                      <Icon name="SkipBack" size={22} />
                    </button>
                    <button
                      onClick={onToggle}
                      className="w-14 h-14 rounded grad-btn flex items-center justify-center animate-pulse-glow"
                    >
                      <Icon
                        name={isPlaying ? "Pause" : "Play"}
                        size={26}
                        className="text-charcoal"
                        style={{ marginLeft: isPlaying ? 0 : 2 } as React.CSSProperties}
                      />
                    </button>
                    <button
                      onClick={onNext}
                      className="text-white/50 hover:text-white transition-colors"
                    >
                      <Icon name="SkipForward" size={22} />
                    </button>
                    <button className="text-white/20 hover:text-white/50 transition-colors">
                      <Icon name="Repeat" size={16} />
                    </button>
                  </div>

                  {/* Громкость */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setPlayer(p => ({ ...p, volume: p.volume === 0 ? 80 : 0 }))}
                      className="text-white/30 hover:text-white/60 transition-colors flex-shrink-0"
                    >
                      <Icon name={volume === 0 ? "VolumeX" : volume < 50 ? "Volume1" : "Volume2"} size={14} />
                    </button>
                    <input
                      type="range" min={0} max={100} value={volume}
                      onChange={e => setPlayer(p => ({ ...p, volume: Number(e.target.value) }))}
                      className="flex-1 h-1 accent-amber cursor-pointer"
                    />
                    <span className="text-white/20 text-xs w-7 text-right">{volume}%</span>
                  </div>
                </div>
              </div>

              {/* Текст песни — прокручивается синхронно */}
              {currentTrack.lyrics && (
                <div className="glass-card rounded-xl overflow-hidden animate-fade-in">
                  <div className="flex items-center justify-between px-5 pt-4 pb-2">
                    <h3 className="font-display text-xs tracking-widest text-foreground/30">
                      ТЕКСТ ПЕСНИ
                    </h3>
                    {isPlaying && (
                      <div className="flex items-end gap-[2px] h-3">
                        <span className="eq-bar" />
                        <span className="eq-bar" />
                        <span className="eq-bar" />
                      </div>
                    )}
                  </div>
                  <LyricsScroller
                    lyrics={currentTrack.lyrics}
                    progress={progress}
                    durationSec={durationSec}
                    isPlaying={isPlaying}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="glass-card rounded-xl p-20 text-center">
              <Icon name="Disc3" size={52} className="text-white/10 mx-auto mb-4" />
              <p className="text-white/25 font-display tracking-widest">ВЫБЕРИ ТРЕК</p>
            </div>
          )}
        </div>

        {/* ── ОЧЕРЕДЬ ──────────────────────────────────── */}
        <div className="glass-card rounded-xl p-3 h-fit max-h-[680px] overflow-y-auto scrollbar-hide">
          <h3 className="font-display text-xs text-foreground/30 px-2 pt-1 pb-3 tracking-widest">
            ОЧЕРЕДЬ · {tracks.length} ТРЕКОВ
          </h3>
          <div className="space-y-0.5">
            {tracks.map((track, i) => {
              const active = currentTrack?.id === track.id;
              return (
                <div
                  key={track.id}
                  onClick={() => onPlay(track)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 group
                    ${active ? "neon-border" : "hover:bg-white/4"}`}
                  style={active ? { background: "rgba(212,144,10,0.06)" } : {}}
                >
                  <div className="w-5 text-center flex-shrink-0">
                    {active && isPlaying ? (
                      <div className="flex items-end justify-center gap-[2px] h-4">
                        <span className="eq-bar" />
                        <span className="eq-bar" />
                        <span className="eq-bar" />
                      </div>
                    ) : (
                      <span className="text-white/20 text-xs group-hover:hidden">{i + 1}</span>
                    )}
                    {!active && (
                      <Icon name="Play" size={12} className="text-white/40 hidden group-hover:block mx-auto" />
                    )}
                  </div>
                  <img
                    src={track.cover}
                    alt=""
                    className="w-8 h-8 rounded object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold truncate ${active ? "grad-text font-display tracking-wide" : "text-foreground/75"}`}>
                      {track.title}
                    </p>
                    <p className="text-white/25 text-xs truncate">{track.artist}</p>
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