import { type LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  body: string;
  delay?: number;
}

export const TipCard = ({ icon: Icon, title, body, delay = 0 }: Props) => (
  <div
    className="glass rounded-3xl p-5 animate-fade-in"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-start gap-4">
      <div className="shrink-0 w-11 h-11 rounded-2xl glass-strong flex items-center justify-center">
        <Icon className="w-5 h-5 text-white" strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <h3 className="text-white font-semibold text-base leading-tight">{title}</h3>
        <p className="text-white/80 text-sm mt-1 leading-relaxed">{body}</p>
      </div>
    </div>
  </div>
);