import { QuizQuestion as QType } from "@/lib/types";
import { Input } from "@/components/ui/input";

interface Props {
  question: QType;
  answer: string;
  onAnswer: (answer: string) => void;
  index: number;
}

const QuizQuestionCard = ({ question, answer, onAnswer, index }: Props) => {
  const typeLabel = question.type === "multiple_choice" 
    ? "Multiple Choice" 
    : question.type === "true_false" 
    ? "True / False" 
    : "Short Answer";

  return (
    <div className="animate-fade-in bg-card rounded-2xl p-6 shadow-soft border border-border space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Question {index + 1}
        </span>
        <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-muted-foreground font-medium">
          {typeLabel}
        </span>
      </div>

      <p className="text-base font-medium leading-relaxed">{question.question}</p>

      {question.type === "multiple_choice" && question.options && (
        <div className="grid gap-2">
          {question.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => onAnswer(opt)}
              className={`text-left p-3.5 rounded-xl border-2 transition-all text-sm ${
                answer === opt
                  ? "border-primary bg-primary/10 font-medium"
                  : "border-border hover:border-primary/40 bg-background"
              }`}
            >
              <span className="text-muted-foreground mr-2 font-semibold">
                {String.fromCharCode(65 + i)}.
              </span>
              {opt}
            </button>
          ))}
        </div>
      )}

      {question.type === "true_false" && (
        <div className="grid grid-cols-2 gap-3">
          {["True", "False"].map((opt) => (
            <button
              key={opt}
              onClick={() => onAnswer(opt)}
              className={`p-3.5 rounded-xl border-2 transition-all text-sm font-medium ${
                answer === opt
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/40 bg-background"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {question.type === "short_answer" && (
        <Input
          placeholder="Type your answer..."
          value={answer}
          onChange={(e) => onAnswer(e.target.value)}
          className="bg-background"
        />
      )}
    </div>
  );
};

export default QuizQuestionCard;
