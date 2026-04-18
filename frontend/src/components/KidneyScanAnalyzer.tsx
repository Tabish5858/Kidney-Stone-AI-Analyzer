import { Button } from '@/components/button';
import { Activity, AlertCircle, CheckCircle, FileImage, Stethoscope, Upload } from 'lucide-react';
import React, { useRef, useState } from 'react';

interface AnalysisResult {
  stoneDetected: boolean;
  stoneProbability: number;
  decisionThreshold: number;
  topClassLabel: string;
  topClassConfidence: number;
}

interface PredictResponse {
  prediction_label: string;
  confidence: string | number;
  stone_detected?: boolean;
  stone_probability?: number;
  decision_threshold?: number;
  top_class_label?: string;
  top_class_confidence?: number;
  error?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

export const KidneyScanAnalyzer = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Invalid file type. Please select an image file (JPG, PNG, etc.).');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File too large. Please select an image smaller than 10MB.');
      return;
    }

    setSelectedFile(file);
    setResult(null);
    setErrorMessage(null);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        body: formData,
      });

      const data = (await response.json()) as PredictResponse;

      if (!response.ok) {
        throw new Error(data.error || 'Prediction request failed.');
      }

      const rawConfidence =
        typeof data.confidence === 'string' ? parseFloat(data.confidence) : data.confidence;

      if (Number.isNaN(rawConfidence)) {
        throw new Error('Backend returned an invalid confidence value.');
      }

      const fallbackConfidence = rawConfidence > 1 ? rawConfidence / 100 : rawConfidence;
      const stoneProbability =
        typeof data.stone_probability === 'number' ? data.stone_probability : fallbackConfidence;
      const stoneDetected =
        typeof data.stone_detected === 'boolean'
          ? data.stone_detected
          : data.prediction_label.toLowerCase() === 'stone';
      const decisionThreshold =
        typeof data.decision_threshold === 'number' ? data.decision_threshold : 0.5;
      const topClassLabel = data.top_class_label ?? data.prediction_label;
      const topClassConfidence =
        typeof data.top_class_confidence === 'number'
          ? data.top_class_confidence
          : fallbackConfidence;

      setResult({
        stoneDetected,
        stoneProbability: Math.max(0, Math.min(1, stoneProbability)),
        decisionThreshold: Math.max(0, Math.min(1, decisionThreshold)),
        topClassLabel,
        topClassConfidence: Math.max(0, Math.min(1, topClassConfidence)),
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred during analysis. Please try again.';
      setErrorMessage(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getResultColor = (stoneDetected: boolean) => {
    return stoneDetected ? 'text-destructive' : 'text-medical-success';
  };

  const getResultIcon = (stoneDetected: boolean) => {
    return stoneDetected ? (
      <AlertCircle className="h-5 w-5 text-destructive" />
    ) : (
      <CheckCircle className="h-5 w-5 text-medical-success" />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue-light to-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Stethoscope className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold text-medical-blue-dark">
              AI Kidney Stone Detection
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload a kidney CT scan image to screen for probable stone presence with confidence scoring.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          <section className="rounded-xl border bg-card p-6 shadow-card">
            <div className="mb-5">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload CT Scan
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Select or drag and drop a CT scan image for stone-focused analysis.
              </p>
            </div>

            <div
              className={`
                relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
                ${dragActive ? 'border-primary bg-medical-blue-light' : 'border-border'}
                ${selectedFile ? 'border-medical-success bg-medical-success/5' : ''}
                hover:border-primary hover:bg-medical-blue-light/50
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />

              {selectedFile ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <FileImage className="h-16 w-16 text-medical-success" />
                  </div>
                  <div>
                    <p className="font-medium text-medical-success">File Selected</p>
                    <p className="text-sm text-muted-foreground">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <Upload className="h-16 w-16 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-lg font-medium">Drag and Drop CT Scan Image Here</p>
                    <p className="text-sm text-muted-foreground">
                      Supports JPG, PNG, and other image formats (max 10MB per scan)
                    </p>
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="mt-4"
                type="button"
              >
                Browse Files
              </Button>
            </div>
          </section>

          <div className="flex justify-center">
            <Button
              variant="medical"
              size="lg"
              onClick={handleAnalyze}
              disabled={!selectedFile || isAnalyzing}
              className="px-8 py-3 text-lg"
            >
              {isAnalyzing ? (
                <>
                  <Activity className="h-5 w-5 animate-spin mr-2" />
                  Detecting Stone Risk...
                </>
              ) : (
                <>
                  <Stethoscope className="h-5 w-5 mr-2" />
                  Run Stone Detection
                </>
              )}
            </Button>
          </div>

          {errorMessage && (
            <section className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-destructive">
              <p className="text-sm">{errorMessage}</p>
            </section>
          )}

          {result && (
            <section className="rounded-xl border bg-card p-6 shadow-card animate-fade-in">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                {getResultIcon(result.stoneDetected)}
                Analysis Result
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Stone-screening outcome generated from the uploaded CT image.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Stone Detection</p>
                  <p className={`text-2xl font-bold ${getResultColor(result.stoneDetected)}`}>
                    {result.stoneDetected ? 'Stone Detected' : 'No Stone Detected'}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Stone Probability</p>
                  <p className="text-2xl font-bold text-foreground">
                    {(result.stoneProbability * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Decision Threshold</p>
                  <p className="text-2xl font-bold text-foreground">
                    {(result.decisionThreshold * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-lg border bg-muted/40 p-4">
                <p className="text-sm text-muted-foreground">
                  Model top class: <strong>{result.topClassLabel}</strong> at{' '}
                  <strong>{(result.topClassConfidence * 100).toFixed(1)}%</strong>
                </p>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Disclaimer:</strong> This output is a decision-support screening signal, not a standalone diagnosis.
                  Final interpretation must be performed by a qualified clinician.
                </p>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
