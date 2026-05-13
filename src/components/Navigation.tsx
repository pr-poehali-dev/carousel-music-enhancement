import Icon from "@/components/ui/icon";
import { PageName } from "../App";

const NAV_ITEMS: { id: PageName; label: string; icon: string }[] = [
  { id: "home",   label: "Главная",  icon: "Home" },
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
          <div className="w-8 h-8 rounded grad-btn flex items-center justify-center">
            <Icon name="Radio" size={15} className="text-charcoal" />
          </div>
          <span className="font-display text-xl tracking-[0.12em] text-foreground">ЗВУК</span>
          <span className="hidden sm:block text-foreground/20 text-xs tracking-widest font-body uppercase">Blues · Rock · Alt</span>
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
                className={`relative p-2 transition-colors ${active ? "text-amber" : "text-foreground/30"}`}
              >
                <Icon name={item.icon} fallback="Music" size={18} />
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
