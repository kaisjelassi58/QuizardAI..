import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/FileUpload";
import DifficultySelector from "@/components/DifficultySelector";
import { Difficulty } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [text, setText] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast({ title: "No content", description: "Please upload a file or paste text first.", variant: "destructive" });
      return;
    }
    if (text.trim().length < 50) {
      toast({ title: "Too short", description: "Please provide more content (at least 50 characters).", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-quiz", {
        body: { text: text.trim().slice(0, 15000), difficulty },
      });

      if (error) throw error;
      if (!data?.questions?.length) throw new Error("No questions generated");

      navigate("/quiz", { state: { quiz: data, sourceText: text, difficulty } });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Generation failed", description: e.message || "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-4xl flex items-center gap-3 py-4">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-display font-bold tracking-tight">PDF to Quiz AI</h1>
        </div>
      </header>

      <main className="container max-w-2xl py-12 px-4 space-y-10">
        {/* Hero */}
        <div className="text-center space-y-3 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Study Tool
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">
            Turn your lessons into
            <span className="text-primary"> interactive quizzes</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Upload your study material and let AI generate tailored questions to help you master the content.
          </p>
        </div>

        {/* Upload */}
        <div className="space-y-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <div>
            <label className="text-sm font-semibold mb-2 block">1. Add your lesson content</label>
            <FileUpload onTextExtracted={setText} isLoading={loading} />
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">2. Choose difficulty</label>
            <DifficultySelector value={difficulty} onChange={setDifficulty} />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading || !text.trim()}
            className="w-full h-12 text-base font-semibold gradient-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-primary"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Quiz…
              </>
            ) : (
              <>
                Generate Quiz
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Index;
