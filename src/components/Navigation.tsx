import Icon from "@/components/ui/icon";
import { PageName } from "../App";

const NAV_ITEMS: { id: PageName; label: string; icon: string }[] = [
  { id: "home", label: "Главная", icon: "Home" },
  { id: "player", label: "Плеер", icon: "Music2" },
  { id: "upload", label: "Загрузка", icon: "Upload" },
  { id: "lyrics", label: "Тексты", icon: "FileText" },
  { id: "admin", label: "Админка", icon: "Settings" },
];

interface Props {
  page: PageName;
  setPage: (p: PageName) => void;
  unreadMessages?: number;
}

export default function Navigation({ page, setPage, unreadMessages = 0 }: Props) {
  return (
    <header className="sticky top-0 z-50 glass-card border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg grad-btn flex items-center justify-center">
            <Icon name="Zap" size={16} className="text-white" />
          </div>
          <span className="font-display text-xl font-bold tracking-widest grad-text">ЗВУК</span>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(item => {
            const isBadge = item.id === "admin" && unreadMessages > 0;
            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 text-sm font-medium font-display tracking-wider uppercase
                  ${page === item.id
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                  }`}
              >
                <Icon name={item.icon} fallback="Music" size={15} />
                {item.label}
                {isBadge && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-neon-pink flex items-center justify-center text-white text-xs font-bold leading-none">
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <nav className="flex md:hidden items-center gap-1">
          {NAV_ITEMS.map(item => {
            const isBadge = item.id === "admin" && unreadMessages > 0;
            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`relative p-2 rounded-xl transition-all duration-200
                  ${page === item.id ? "bg-white/10 text-white" : "text-white/40"}`}
              >
                <Icon name={item.icon} fallback="Music" size={18} />
                {isBadge && (
                  <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-neon-pink flex items-center justify-center text-white text-xs font-bold leading-none">
                    {unreadMessages > 9 ? "·" : unreadMessages}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
