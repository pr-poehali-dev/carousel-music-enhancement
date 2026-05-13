import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Message } from "../types/music";

interface Props {
  onSend: (msg: Message) => void;
}

export default function MessageForm({ onSend }: Props) {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    if (!text.trim()) return;
    const msg: Message = {
      id: Math.random().toString(36).slice(2),
      name: name.trim() || "Аноним",
      text: text.trim(),
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    onSend(msg);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setName("");
    setText("");
  };

  if (sent) {
    return (
      <div className="glass-card rounded-3xl p-8 text-center animate-scale-in">
        <div className="w-14 h-14 rounded-full grad-btn flex items-center justify-center mx-auto mb-4">
          <Icon name="Check" size={24} className="text-white" />
        </div>
        <h3 className="font-display text-xl font-bold text-white mb-1 tracking-wider">ОТПРАВЛЕНО!</h3>
        <p className="text-white/40 text-sm">Спасибо за сообщение</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-3xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl grad-btn flex items-center justify-center flex-shrink-0">
          <Icon name="MessageCircle" size={18} className="text-white" />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold text-white tracking-wider">НАПИСАТЬ НАМ</h3>
          <p className="text-white/40 text-xs">Отвечаем на все сообщения</p>
        </div>
      </div>

      <div className="space-y-3">
        <input
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-neon-pink/50 transition-colors"
          placeholder="Ваше имя (необязательно)"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={60}
        />
        <textarea
          className="w-full h-28 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-neon-pink/50 resize-none leading-relaxed transition-colors"
          placeholder="Ваше сообщение..."
          value={text}
          onChange={e => setText(e.target.value)}
          maxLength={500}
        />
        <div className="flex items-center justify-between">
          <span className="text-white/20 text-xs">{text.length}/500</span>
          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className={`px-6 py-2.5 rounded-xl font-display tracking-wider text-sm flex items-center gap-2 transition-all
              ${text.trim() ? "grad-btn text-white" : "bg-white/5 text-white/20 cursor-not-allowed"}`}
          >
            <Icon name="Send" size={14} />
            Отправить
          </button>
        </div>
      </div>
    </div>
  );
}
