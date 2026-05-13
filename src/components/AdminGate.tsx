import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";
import func2url from "../../backend/func2url.json";

const AUTH_URL = func2url.auth;

interface Props {
  children: React.ReactNode;
  title?: string;
}

export default function AdminGate({ children, title = "СТУДИЯ" }: Props) {
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem("admin_ok") === "1"
  );
  const [input,    setInput]    = useState("");
  const [shake,    setShake]    = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [attempts, setAttempts] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!unlocked) setTimeout(() => inputRef.current?.focus(), 80);
  }, [unlocked]);

  const submit = async () => {
    if (!input || loading) return;
    setLoading(true);
    try {
      const res  = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: input }),
      });
      const data = await res.json();
      if (data.ok) {
        sessionStorage.setItem("admin_ok", "1");
        setUnlocked(true);
      } else {
        setAttempts(a => a + 1);
        setShake(true);
        setInput("");
        setTimeout(() => setShake(false), 500);
      }
    } catch {
      setAttempts(a => a + 1);
      setShake(true);
      setInput("");
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  if (unlocked) return <>{children}</>;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div
        className="glass-card rounded-2xl w-full max-w-sm p-8 text-center"
        style={shake ? { animation: "shake 0.45s ease" } : {}}
      >
        <div className="w-14 h-14 rounded-xl grad-btn flex items-center justify-center mx-auto mb-5">
          <Icon name="Lock" size={24} className="text-charcoal" />
        </div>

        <h2 className="font-display text-2xl tracking-widest text-foreground mb-1">{title}</h2>
        <p className="text-foreground/35 text-sm mb-6 font-body">Только для автора</p>

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
            maxLength={64}
          />
        </div>

        {attempts > 0 && (
          <p className="text-rust/70 text-xs mb-3 font-body">
            Неверный пароль{attempts > 1 ? ` · попыток: ${attempts}` : ""}
          </p>
        )}

        <button
          onClick={submit}
          disabled={!input || loading}
          className={`w-full py-3 rounded-lg font-display tracking-widest text-sm transition-all flex items-center justify-center gap-2
            ${input && !loading ? "grad-btn text-white" : "bg-white/5 text-foreground/20 cursor-not-allowed"}`}
        >
          {loading
            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Проверяю...</>
            : "Войти"
          }
        </button>

        <p className="text-foreground/15 text-xs mt-5 font-body">
          Радио ПРИКОСНОВЕНЬЕ · Авторское
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
