import { Difficulty } from "@/lib/types";
import { Zap, BarChart3, Flame } from "lucide-react";

interface DifficultySelectorProps {
  value: Difficulty;
  onChange: (d: Difficulty) => void;
}

const options: { value: Difficulty; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: "easy", label: "Easy", icon: <Zap className="w-4 h-4" />, desc: "10 questions" },
  { value: "medium", label: "Medium", icon: <BarChart3 className="w-4 h-4" />, desc: "15 questions" },
  { value: "hard", label: "Hard", icon: <Flame className="w-4 h-4" />, desc: "20 questions" },
];

const DifficultySelector = ({ value, onChange }: DifficultySelectorProps) => (
  <div className="grid grid-cols-3 gap-3">
    {options.map((opt) => (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all ${
          value === opt.value
            ? "border-primary bg-primary/10 shadow-primary"
            : "border-border hover:border-primary/40 bg-card"
        }`}
      >
        <span className={value === opt.value ? "text-primary" : "text-muted-foreground"}>
          {opt.icon}
        </span>
        <span className="text-sm font-semibold">{opt.label}</span>
        <span className="text-xs text-muted-foreground">{opt.desc}</span>
      </button>
    ))}
  </div>
);

export default DifficultySelector;
