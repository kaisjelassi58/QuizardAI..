import { QuizResult } from "@/lib/types";
import { CheckCircle2, XCircle, Lightbulb } from "lucide-react";

interface Props {
  result: QuizResult;
  index: number;
}

const ResultCard = ({ result, index }: Props) => (
  <div
    className={`animate-fade-in rounded-2xl p-5 border-2 space-y-3 ${
      result.isCorrect
        ? "border-success/30 bg-success/5"
        : "border-destructive/30 bg-destructive/5"
    }`}
    style={{ animationDelay: `${index * 60}ms` }}
  >
    <div className="flex items-start gap-3">
      {result.isCorrect ? (
        <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
      ) : (
        <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
      )}
      <div className="space-y-1 flex-1">
        <p className="text-sm font-medium leading-relaxed">
          {result.question.question}
        </p>
        <p className="text-xs text-muted-foreground">
          Your answer: <span className="font-medium text-foreground">{result.userAnswer || "—"}</span>
        </p>
        {!result.isCorrect && (
          <p className="text-xs text-success font-medium">
            Correct: {result.question.correctAnswer}
          </p>
        )}
      </div>
    </div>

    <div className="flex items-start gap-2 pl-8">
      <Lightbulb className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
      <p className="text-xs text-muted-foreground leading-relaxed">
        {result.question.explanation}
      </p>
    </div>
  </div>
);

export default ResultCard;
