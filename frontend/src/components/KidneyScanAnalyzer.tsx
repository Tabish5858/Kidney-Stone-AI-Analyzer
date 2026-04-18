import { Button } from '@/components/button';
import { Activity, AlertCircle, CheckCircle, FileImage, Stethoscope, Upload } from 'lucide-react';
import React, { useRef, useState } from 'react';

interface AnalysisResult {
  label: string;
  confidence: number;
}

interface PredictResponse {
  prediction_label: string;
  confidence: string | number;
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

      const normalizedConfidence = rawConfidence > 1 ? rawConfidence / 100 : rawConfidence;

      setResult({
        label: data.prediction_label,
        confidence: Math.max(0, Math.min(1, normalizedConfidence)),
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

  const getResultColor = (label: string) => {
    switch (label.toLowerCase()) {
      case 'normal':
        return 'text-medical-success';
      case 'cyst':
      case 'stone':
      case 'tumor':
        return 'text-medical-warning';
      default:
        return 'text-foreground';
    }
  };

  const getResultIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case 'normal':
        return <CheckCircle className="h-5 w-5 text-medical-success" />;
      case 'cyst':
      case 'stone':
      case 'tumor':
        return <AlertCircle className="h-5 w-5 text-medical-warning" />;
      default:
        return <Activity className="h-5 w-5 text-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue-light to-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Stethoscope className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold text-medical-blue-dark">
              AI-Powered Kidney Scan Analyzer
            </h1>
            <span className="text-4xl">🩺</span>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload a patient's axial CT scan to classify the kidney's condition using advanced AI technology.
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
                Select or drag and drop a CT scan image for analysis.
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
                      Supports JPG, PNG, and other image formats (max 10MB)
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
                  Analyzing Scan...
                </>
              ) : (
                <>
                  <Stethoscope className="h-5 w-5 mr-2" />
                  Analyze Scan
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
                {getResultIcon(result.label)}
                Analysis Result
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                AI-powered diagnosis based on the uploaded CT scan.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Diagnosis</p>
                  <p className={`text-2xl font-bold ${getResultColor(result.label)}`}>{result.label}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Confidence Score</p>
                  <p className="text-2xl font-bold text-foreground">
                    {(result.confidence * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Disclaimer:</strong> This AI analysis is for educational and research purposes only.
                  Always consult with a qualified healthcare professional for medical diagnosis and treatment decisions.
                </p>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
