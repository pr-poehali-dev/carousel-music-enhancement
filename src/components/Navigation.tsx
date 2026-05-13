import Icon from "@/components/ui/icon";
import { PageName } from "../App";

const NAV_ITEMS: { id: PageName; label: string; icon: string }[] = [
  { id: "home",   label: "Карусель", icon: "Box" },
  { id: "player", label: "Плеер",    icon: "Disc3" },
  { id: "upload", label: "Загрузка", icon: "Upload" },
  { id: "lyrics", label: "Тексты",   icon: "FileText" },
  { id: "admin",  label: "Студия",   icon: "Settings2" },
];

interface Props {
  page: PageName;
  setPage: (p: PageName) => void;
  unreadMessages?: number;
}

export default function Navigation({ page, setPage, unreadMessages = 0 }: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-amber/10"
      style={{ background: "rgba(10,8,5,0.96)", backdropFilter: "blur(16px)" }}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Лого */}
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 flex-shrink-0 cursor-pointer group"
            onClick={() => document.getElementById('avatar-upload')?.click()}>
            <img
              id="avatar-img"
              src={(typeof window !== 'undefined' && localStorage.getItem('avatar')) || ''}
              alt=""
              className="w-9 h-9 rounded-full object-cover border-2 border-amber/40"
              style={{ display: (typeof window !== 'undefined' && localStorage.getItem('avatar')) ? 'block' : 'none' }}
            />
            <div
              id="avatar-placeholder"
              className="w-9 h-9 rounded-full grad-btn flex items-center justify-center"
              style={{ display: (typeof window !== 'undefined' && localStorage.getItem('avatar')) ? 'none' : 'flex' }}
            >
              <Icon name="User" size={16} className="text-charcoal" />
            </div>
            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Icon name="Camera" size={12} className="text-white" />
            </div>
            <input id="avatar-upload" type="file" accept="image/*" className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (!f) return;
                const canvas = document.createElement('canvas');
                canvas.width = 128;
                canvas.height = 128;
                const ctx = canvas.getContext('2d')!;
                const img2 = new Image();
                img2.onload = () => {
                  ctx.drawImage(img2, 0, 0, 128, 128);
                  const url = canvas.toDataURL('image/jpeg', 0.7);
                  try { localStorage.setItem('avatar', url); } catch { /* квота */ }
                  const img = document.getElementById('avatar-img') as HTMLImageElement;
                  const ph  = document.getElementById('avatar-placeholder') as HTMLElement;
                  if (img) { img.src = url; img.style.display = 'block'; }
                  if (ph)  { ph.style.display = 'none'; }
                  URL.revokeObjectURL(img2.src);
                };
                img2.src = URL.createObjectURL(f);
              }}
            />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-lg tracking-[0.12em] text-foreground">ПРИКОСНОВЕНЬЕ</span>
            <span className="text-foreground/25 text-[10px] tracking-widest font-body uppercase">музыкальная карусель</span>
          </div>
        </div>

        {/* Десктоп */}
        <nav className="hidden md:flex items-center">
          {NAV_ITEMS.map(item => {
            const isBadge = item.id === "admin" && unreadMessages > 0;
            const active  = page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`relative flex items-center gap-1.5 px-4 py-3 text-xs font-display tracking-widest uppercase transition-all duration-200 border-b-2
                  ${active
                    ? "text-amber border-amber"
                    : "text-foreground/35 hover:text-foreground/70 border-transparent"
                  }`}
              >
                <Icon name={item.icon} fallback="Music" size={13} />
                {item.label}
                {isBadge && (
                  <span className="absolute -top-0.5 right-1 w-3.5 h-3.5 rounded-full bg-rust flex items-center justify-center text-white text-xs leading-none font-bold">
                    {unreadMessages > 9 ? "·" : unreadMessages}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Мобильная */}
        <nav className="flex md:hidden items-center gap-1">
          {NAV_ITEMS.map(item => {
            const isBadge = item.id === "admin" && unreadMessages > 0;
            const active  = page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`relative flex flex-col items-center gap-0.5 px-2 py-1 transition-colors ${active ? "text-amber" : "text-foreground/30"}`}
              >
                <Icon name={item.icon} fallback="Music" size={18} />
                <span className="text-[9px] font-display tracking-wider leading-none">{item.label}</span>
                {isBadge && (
                  <span className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-rust" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}