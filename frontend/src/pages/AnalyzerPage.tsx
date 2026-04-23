import { Button } from "@/components/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Activity, AlertCircle, CheckCircle2, FileImage, UploadCloud } from "lucide-react";
import { useRef, useState, type DragEvent } from "react";

type StoneBoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
  center_x: number;
  center_y: number;
};

type StoneSizePx = {
  area: number;
  width: number;
  height: number;
  max_dimension: number;
  equivalent_diameter: number;
};

type StoneSizeMm = {
  width: number;
  height: number;
  max_dimension: number;
  equivalent_diameter: number;
  pixel_spacing: number;
};

type StoneMeasurement = {
  available: boolean;
  method: string;
  reason?: string;
  bounding_box?: StoneBoundingBox;
  size_px?: StoneSizePx;
  size_mm?: StoneSizeMm;
};

type PredictResponse = {
  prediction_label: string;
  confidence?: string | number;
  stone_detected?: boolean;
  stone_probability?: number;
  decision_threshold?: number;
  top_class_label?: string;
  top_class_confidence?: number;
  stone_measurement?: StoneMeasurement;
  error?: string;
};

type AnalyzerResult = {
  stoneDetected: boolean;
  stoneProbability: number;
  decisionThreshold: number;
  topClassLabel: string;
  topClassConfidence: number;
  stoneMeasurement: StoneMeasurement | null;
};

const parseStoneMeasurement = (
  measurement: StoneMeasurement | undefined,
  stoneDetected: boolean
): StoneMeasurement | null => {
  if (!measurement) {
    return stoneDetected
      ? {
        available: false,
        method: "intensity_component_v1",
        reason: "measurement_missing",
      }
      : null;
  }

  return measurement;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";

const AnalyzerPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pixelSpacingMm, setPixelSpacingMm] = useState<string>("0.5");
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

      const spacingValue = Number.parseFloat(pixelSpacingMm);
      if (Number.isFinite(spacingValue) && spacingValue > 0) {
        payload.append("pixel_spacing_mm", spacingValue.toString());
      }

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
        stoneMeasurement: parseStoneMeasurement(
          data.stone_measurement,
          typeof data.stone_detected === "boolean"
            ? data.stone_detected
            : data.prediction_label === "stone"
        ),
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
            <div className="mt-5 space-y-3">
              <label htmlFor="pixel_spacing" className="block">
                <p className="text-sm font-semibold text-foreground">Pixel Spacing (optional)</p>
                <p className="mt-1 text-xs text-muted-foreground">Enter mm per pixel for accurate physical size (e.g., 0.5 for 0.5mm/pixel). If empty, only pixel measurements shown.</p>
                <input
                  id="pixel_spacing"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="100"
                  value={pixelSpacingMm}
                  onChange={(e) => setPixelSpacingMm(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-white/40 bg-white/70 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0.5"
                />
              </label>
            </div>
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

                <div className="rounded-2xl border border-white/50 bg-white/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.09em] text-muted-foreground">Estimated Stone Size</p>
                  {result.stoneMeasurement?.available && result.stoneMeasurement.size_px ? (
                    <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                      <p>
                        Max dimension {" "}
                        <span className="font-semibold text-foreground">
                          {result.stoneMeasurement.size_px.max_dimension}px
                        </span>
                      </p>
                      <p>
                        Equivalent diameter {" "}
                        <span className="font-semibold text-foreground">
                          {result.stoneMeasurement.size_px.equivalent_diameter.toFixed(2)}px
                        </span>
                      </p>
                      <p>
                        Bounding box {" "}
                        <span className="font-semibold text-foreground">
                          {result.stoneMeasurement.size_px.width}x{result.stoneMeasurement.size_px.height}px
                        </span>
                      </p>
                      {result.stoneMeasurement.bounding_box ? (
                        <p>
                          Location {" "}
                          <span className="font-semibold text-foreground">
                            x={result.stoneMeasurement.bounding_box.x}, y={result.stoneMeasurement.bounding_box.y}
                          </span>
                        </p>
                      ) : null}
                      {result.stoneMeasurement.size_mm ? (
                        <div className="rounded-lg border border-primary/30 bg-primary/10 p-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Physical Size (Millimeters)</p>
                          <div className="mt-2 space-y-1 text-sm">
                            <p>
                              Max dimension {" "}
                              <span className="font-semibold text-foreground">
                                {result.stoneMeasurement.size_mm.max_dimension.toFixed(2)} mm
                              </span>
                              {" "}
                              <span className="text-xs text-muted-foreground">
                                ({(result.stoneMeasurement.size_mm.max_dimension / 10).toFixed(2)} cm)
                              </span>
                            </p>
                            <p>
                              Equivalent diameter {" "}
                              <span className="font-semibold text-foreground">
                                {result.stoneMeasurement.size_mm.equivalent_diameter.toFixed(2)} mm
                              </span>
                              {" "}
                              <span className="text-xs text-muted-foreground">
                                ({(result.stoneMeasurement.size_mm.equivalent_diameter / 10).toFixed(2)} cm)
                              </span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Based on {result.stoneMeasurement.size_mm.pixel_spacing} mm/pixel spacing
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="rounded-lg border border-amber-200/50 bg-amber-50/60 p-3 text-xs text-amber-900">
                          💡 To see measurements in mm/cm, enter pixel spacing above (e.g., 0.5 mm/pixel for typical CT scans) and run detection again.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {result.stoneDetected
                        ? "Stone was detected, but size estimation was not available for this image."
                        : "Size estimation is only generated when stone is detected."}
                    </p>
                  )}
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
