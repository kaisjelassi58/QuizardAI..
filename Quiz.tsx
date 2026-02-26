import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Brain, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import QuizQuestionCard from "@/components/QuizQuestion";
import QuizProgress from "@/components/QuizProgress";
import { Quiz as QuizType, UserAnswer, QuizResult } from "@/lib/types";

const Quiz = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const quiz = location.state?.quiz as QuizType | undefined;
  const sourceText = location.state?.sourceText as string;
  const difficulty = location.state?.difficulty as string;

  const [answers, setAnswers] = useState<Record<number, string>>({});

  if (!quiz) {
    navigate("/");
    return null;
  }

  const answeredCount = Object.values(answers).filter((a) => a.trim()).length;

  const handleAnswer = (qId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: answer }));
  };

  const handleSubmit = () => {
    const results: QuizResult[] = quiz.questions.map((q) => {
      const userAnswer = answers[q.id] || "";
      const isCorrect =
        q.type === "short_answer"
          ? userAnswer.trim().toLowerCase().includes(q.correctAnswer.trim().toLowerCase())
          : userAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
      return { question: q, userAnswer, isCorrect };
    });

    navigate("/results", { state: { results, sourceText, difficulty } });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-4xl flex items-center gap-3 py-4">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-display font-bold tracking-tight">Quiz Time</h1>
        </div>
      </header>

      <main className="container max-w-2xl py-8 px-4 space-y-6">
        <QuizProgress current={answeredCount} total={quiz.questions.length} />

        <div className="space-y-4">
          {quiz.questions.map((q, i) => (
            <QuizQuestionCard
              key={q.id}
              question={q}
              answer={answers[q.id] || ""}
              onAnswer={(a) => handleAnswer(q.id, a)}
              index={i}
            />
          ))}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={answeredCount === 0}
          className="w-full h-12 text-base font-semibold gradient-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-primary"
          size="lg"
        >
          <Send className="w-5 h-5 mr-2" />
          Submit Quiz
        </Button>
      </main>
    </div>
  );
};

export default Quiz;
