import { useState, useCallback } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { extractTextFromFile } from "@/lib/fileParser";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onTextExtracted: (text: string) => void;
  isLoading: boolean;
}

const FileUpload = ({ onTextExtracted, isLoading }: FileUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [mode, setMode] = useState<"upload" | "paste">("upload");
  const [dragActive, setDragActive] = useState(false);
  const [parsing, setParsing] = useState(false);
  const { toast } = useToast();

  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    setParsing(true);
    try {
      const text = await extractTextFromFile(f);
      if (!text.trim()) {
        toast({ title: "No text found", description: "Could not extract text from this file. Try pasting the content instead.", variant: "destructive" });
        onTextExtracted("");
      } else {
        onTextExtracted(text);
      }
    } catch (e) {
      console.error("Parse error:", e);
      toast({ title: "Parse error", description: "Failed to read this file. Try a different format or paste text.", variant: "destructive" });
      onTextExtracted("");
    } finally {
      setParsing(false);
    }
  }, [onTextExtracted, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handlePaste = (text: string) => {
    setPastedText(text);
    onTextExtracted(text);
  };

  const clearFile = () => {
    setFile(null);
    onTextExtracted("");
  };

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex gap-2 p-1 bg-secondary rounded-lg w-fit">
        <button
          onClick={() => setMode("upload")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            mode === "upload"
              ? "bg-card shadow-soft text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Upload File
        </button>
        <button
          onClick={() => setMode("paste")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            mode === "paste"
              ? "bg-card shadow-soft text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Paste Text
        </button>
      </div>

      {mode === "upload" ? (
        file ? (
        <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
            <FileText className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium flex-1 truncate">{file.name}</span>
            {parsing && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
            <Button variant="ghost" size="sm" onClick={clearFile} disabled={isLoading || parsing}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
            }`}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            <Upload className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">
              Drop your file here or click to browse
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PDF, DOCX, or TXT (max 10MB)
            </p>
          </div>
        )
      ) : (
        <Textarea
          placeholder="Paste your lesson content here..."
          value={pastedText}
          onChange={(e) => handlePaste(e.target.value)}
          className="min-h-[200px] resize-none bg-card"
          disabled={isLoading}
        />
      )}
    </div>
  );
};

export default FileUpload;
