import { useLocation, useNavigate } from "react-router-dom";
import { Brain, RotateCcw, Home, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import ResultCard from "@/components/ResultCard";
import { QuizResult, Difficulty } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const results = location.state?.results as QuizResult[] | undefined;
  const sourceText = location.state?.sourceText as string;
  const difficulty = (location.state?.difficulty as Difficulty) || "medium";
  const [regenerating, setRegenerating] = useState(false);
  const { toast } = useToast();

  if (!results) {
    navigate("/");
    return null;
  }

  const correct = results.filter((r) => r.isCorrect).length;
  const total = results.length;
  const pct = Math.round((correct / total) * 100);

  const handleRegenerate = async () => {
    if (!sourceText) return;
    setRegenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-quiz", {
        body: { text: sourceText.slice(0, 15000), difficulty },
      });
      if (error) throw error;
      navigate("/quiz", { state: { quiz: data, sourceText, difficulty } });
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-4xl flex items-center gap-3 py-4">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-display font-bold tracking-tight">Results</h1>
        </div>
      </header>

      <main className="container max-w-2xl py-8 px-4 space-y-8">
        {/* Score */}
        <div className="text-center animate-fade-in space-y-3">
          <div className="w-20 h-20 mx-auto rounded-2xl gradient-primary flex items-center justify-center shadow-primary">
            <Trophy className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="text-4xl font-display font-bold">{pct}%</h2>
          <p className="text-muted-foreground">
            You got <span className="text-foreground font-semibold">{correct}</span> out of{" "}
            <span className="text-foreground font-semibold">{total}</span> correct
          </p>
        </div>

        {/* Results */}
        <div className="space-y-3">
          {results.map((r, i) => (
            <ResultCard key={r.question.id} result={r} index={i} />
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-11"
            onClick={() => navigate("/")}
          >
            <Home className="w-4 h-4 mr-2" />
            New Lesson
          </Button>
          <Button
            onClick={handleRegenerate}
            disabled={regenerating || !sourceText}
            className="flex-1 h-11 gradient-primary text-primary-foreground hover:opacity-90 shadow-primary"
          >
            {regenerating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4 mr-2" />
            )}
            New Quiz
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Results;
