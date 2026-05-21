import { useState } from 'react';
import { X, Upload, File, Check } from 'lucide-react';

interface UploadPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
  paperTitle: string;
}

export function UploadPdfModal({ isOpen, onClose, onUpload, paperTitle }: UploadPdfModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

  const handleClose = () => {
    setSelectedFile(null);
    setIsDragging(false);
    setErrorMessage(null);
    onClose();
  };

  const validateFile = (file: File) => {
    if (file.type !== 'application/pdf') return 'Only PDF files are accepted.';
    if (file.size > MAX_FILE_SIZE) return 'File size must be less than 20MB.';
    return null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setErrorMessage(null);
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      setSelectedFile(null);
      setErrorMessage(error);
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    setErrorMessage(null);
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      setSelectedFile(null);
      setErrorMessage(error);
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
      setSelectedFile(null);
      handleClose();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-foreground">Upload PDF</h2>
            <p className="text-muted-foreground mt-1">{paperTitle}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              isDragging
                ? 'border-primary bg-blue-50'
                : 'border-border hover:border-primary hover:bg-accent'
            }`}
          >
            {!selectedFile ? (
              <>
                <Upload size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-foreground mb-2">Upload PDF File</h3>
                <p className="text-muted-foreground mb-4">
                  Drag and drop your PDF file here, or click to browse
                </p>
                <label className="inline-block">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <span className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-blue-600 transition-colors cursor-pointer inline-block">
                    Browse Files
                  </span>
                </label>
              </>
            ) : (
              <div className="flex items-center justify-center gap-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <File size={32} className="text-green-600" />
                </div>
                <div className="text-left">
                  <p className="text-foreground flex items-center gap-2">
                    <Check size={18} className="text-green-600" />
                    {selectedFile.name}
                  </p>
                  <p className="text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setErrorMessage(null);
                  }}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors ml-4"
                >
                  <X size={20} className="text-red-600" />
                </button>
              </div>
            )}
          </div>

          {errorMessage ? (
            <p className="text-destructive text-sm mt-3">{errorMessage}</p>
          ) : null}

          <p className="text-muted-foreground mt-4">
            Maximum file size: 20MB. Only PDF files are accepted.
          </p>
        </div>

        <div className="flex gap-4 p-6 border-t border-border">
          <button
            onClick={handleClose}
            className="flex-1 px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile}
            className={`flex-1 px-6 py-3 rounded-lg transition-colors ${
              selectedFile
                ? 'bg-primary text-primary-foreground hover:bg-blue-600'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            Upload PDF
          </button>
        </div>
      </div>
    </div>
  );
}
