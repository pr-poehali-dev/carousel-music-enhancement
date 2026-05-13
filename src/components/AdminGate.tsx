import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

// ── Пароль меняй здесь ──────────────────────────────
const ADMIN_PASSWORD = "blues2024";
// ───────────────────────────────────────────────────

interface Props {
  children: React.ReactNode;
}

export default function AdminGate({ children }: Props) {
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem("admin_ok") === "1"
  );
  const [input, setInput]     = useState("");
  const [shake, setShake]     = useState(false);
  const [attempts, setAttempts] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!unlocked) setTimeout(() => inputRef.current?.focus(), 80);
  }, [unlocked]);

  const submit = () => {
    if (input === ADMIN_PASSWORD) {
      sessionStorage.setItem("admin_ok", "1");
      setUnlocked(true);
    } else {
      setAttempts(a => a + 1);
      setShake(true);
      setInput("");
      setTimeout(() => setShake(false), 500);
    }
  };

  if (unlocked) return <>{children}</>;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div
        className={`glass-card neon-border rounded-xl w-full max-w-sm p-8 text-center transition-transform ${shake ? "animate-shake" : ""}`}
        style={shake ? { animation: "shake 0.45s ease" } : {}}
      >
        {/* Иконка */}
        <div className="w-14 h-14 rounded-xl grad-btn flex items-center justify-center mx-auto mb-5">
          <Icon name="Lock" size={24} className="text-charcoal" />
        </div>

        <h2 className="font-display text-2xl tracking-widest text-foreground mb-1">СТУДИЯ</h2>
        <p className="text-foreground/35 text-sm mb-6 font-body">Только для администратора</p>

        {/* Поле пароля */}
        <div className="relative mb-3">
          <input
            ref={inputRef}
            type="password"
            className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-center text-foreground text-sm font-body tracking-widest focus:outline-none transition-colors
              ${attempts > 0 ? "border-rust/60 focus:border-rust" : "border-white/10 focus:border-amber/50"}`}
            placeholder="••••••••"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
            maxLength={32}
          />
        </div>

        {attempts > 0 && (
          <p className="text-rust/70 text-xs mb-3 font-body">
            Неверный пароль{attempts > 1 ? ` · ${attempts} попытки` : ""}
          </p>
        )}

        <button
          onClick={submit}
          disabled={!input}
          className={`w-full py-3 rounded-lg font-display tracking-widest text-sm transition-all
            ${input ? "grad-btn text-charcoal" : "bg-white/5 text-foreground/20 cursor-not-allowed"}`}
        >
          Войти
        </button>

        <p className="text-foreground/15 text-xs mt-5 font-body">
          Сессия сохраняется до закрытия вкладки
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-8px); }
          40%       { transform: translateX(8px); }
          60%       { transform: translateX(-5px); }
          80%       { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}
