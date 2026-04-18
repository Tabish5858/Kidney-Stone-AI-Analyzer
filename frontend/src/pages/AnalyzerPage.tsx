import { Button } from "@/components/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Activity, AlertCircle, CheckCircle2, FileImage, UploadCloud } from "lucide-react";
import { useRef, useState, type DragEvent } from "react";

type PredictResponse = {
  prediction_label: string;
  confidence?: string | number;
  stone_detected?: boolean;
  stone_probability?: number;
  decision_threshold?: number;
  top_class_label?: string;
  top_class_confidence?: number;
  error?: string;
};

type AnalyzerResult = {
  stoneDetected: boolean;
  stoneProbability: number;
  decisionThreshold: number;
  topClassLabel: string;
  topClassConfidence: number;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";

const AnalyzerPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzerResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelection = (selectedFile: File | null) => {
    if (!selectedFile) {
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File is too large. Maximum supported size is 10MB.");
      return;
    }

    setFile(selectedFile);
    setError(null);
    setResult(null);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const droppedFile = event.dataTransfer.files?.[0] ?? null;
    handleSelection(droppedFile);
  };

  const runAnalysis = async () => {
    if (!file) {
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const payload = new FormData();
      payload.append("file", file);

      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        body: payload,
      });

      const data = (await response.json()) as PredictResponse;

      if (!response.ok) {
        throw new Error(data.error || "Prediction failed.");
      }

      const confidenceRaw =
        typeof data.confidence === "string"
          ? Number.parseFloat(data.confidence)
          : data.confidence ?? data.stone_probability ?? 0;

      const fallbackProbability =
        Number.isFinite(confidenceRaw) && confidenceRaw > 1 ? confidenceRaw / 100 : confidenceRaw;

      const stoneProbability =
        typeof data.stone_probability === "number" ? data.stone_probability : fallbackProbability;

      setResult({
        stoneDetected:
          typeof data.stone_detected === "boolean"
            ? data.stone_detected
            : data.prediction_label === "stone",
        stoneProbability: Math.max(0, Math.min(1, stoneProbability ?? 0)),
        decisionThreshold: Math.max(0, Math.min(1, data.decision_threshold ?? 0.5)),
        topClassLabel: data.top_class_label ?? data.prediction_label ?? "unknown",
        topClassConfidence: Math.max(0, Math.min(1, data.top_class_confidence ?? stoneProbability ?? 0)),
      });
    } catch (unknownError: unknown) {
      const message = unknownError instanceof Error ? unknownError.message : "Unexpected error during analysis.";
      setError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <SiteLayout>
      <section className="mx-auto mt-10 w-full max-w-6xl px-6 md:mt-14">
        <div className="section-title-wrap">
          <p className="eyebrow">Live Analyzer</p>
          <h1 className="display-title max-w-4xl text-balance">Kidney stone screening in one clean interaction.</h1>
          <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
            Upload a CT scan image and receive a stone-focused decision signal with probability, threshold, and top-class context.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="glass-card rounded-3xl p-6 md:p-8">
            <h2 className="text-xl font-semibold text-foreground">Upload CT Image</h2>
            <p className="mt-2 text-sm text-muted-foreground">Supported formats: JPG, PNG, BMP, WEBP. Max file size: 10MB.</p>

            <div
              className={`mt-6 rounded-3xl border-2 border-dashed p-8 text-center transition-all duration-300 ${isDragging
                  ? "border-primary bg-primary/10"
                  : file
                    ? "border-emerald-400/70 bg-emerald-100/55"
                    : "border-white/50 bg-white/55"
                }`}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => handleSelection(event.target.files?.[0] ?? null)}
              />

              {file ? (
                <div className="space-y-3">
                  <FileImage className="mx-auto h-12 w-12 text-emerald-600" />
                  <p className="font-semibold text-foreground">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <UploadCloud className="mx-auto h-12 w-12 text-primary" />
                  <p className="font-semibold text-foreground">Drop image here or browse</p>
                  <p className="text-sm text-muted-foreground">A single CT slice image is enough for a quick screening pass.</p>
                </div>
              )}

              <Button type="button" variant="outline" className="mt-5 rounded-full bg-white/80" onClick={() => inputRef.current?.click()}>
                Choose File
              </Button>
            </div>

            <Button
              type="button"
              className="mt-6 w-full rounded-full"
              disabled={!file || isAnalyzing}
              onClick={runAnalysis}
            >
              {isAnalyzing ? (
                <>
                  <Activity className="h-4 w-4 animate-spin" />
                  Running stone detection
                </>
              ) : (
                "Run stone detection"
              )}
            </Button>

            {error ? (
              <div className="mt-4 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}
          </article>

          <article className="glass-card rounded-3xl p-6 md:p-8">
            <h2 className="text-xl font-semibold text-foreground">Prediction Result</h2>
            <p className="mt-2 text-sm text-muted-foreground">Decision-support output for rapid triage and reviewer context.</p>

            {result ? (
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-white/50 bg-white/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.09em] text-muted-foreground">Stone Detection</p>
                  <div className="mt-2 flex items-center gap-2">
                    {result.stoneDetected ? (
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    )}
                    <p className={`text-xl font-semibold ${result.stoneDetected ? "text-destructive" : "text-emerald-700"}`}>
                      {result.stoneDetected ? "Stone detected" : "No stone detected"}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/50 bg-white/70 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.09em] text-muted-foreground">Stone Probability</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{(result.stoneProbability * 100).toFixed(1)}%</p>
                  </div>
                  <div className="rounded-2xl border border-white/50 bg-white/70 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.09em] text-muted-foreground">Decision Threshold</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{(result.decisionThreshold * 100).toFixed(1)}%</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/50 bg-white/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.09em] text-muted-foreground">Top Model Class</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">{result.topClassLabel}</p>
                  <p className="text-sm text-muted-foreground">
                    Confidence {" "}
                    <span className="font-semibold text-foreground">{(result.topClassConfidence * 100).toFixed(1)}%</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-white/50 bg-white/60 p-6 text-sm leading-relaxed text-muted-foreground">
                No result yet. Upload a scan and run detection to view the stone decision signal.
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-white/50 bg-white/60 p-4 text-xs leading-relaxed text-muted-foreground">
              This output is intended for decision support and workflow acceleration. Final diagnosis remains the responsibility of licensed clinicians.
            </div>
          </article>
        </div>
      </section>
    </SiteLayout>
  );
};

export default AnalyzerPage;
