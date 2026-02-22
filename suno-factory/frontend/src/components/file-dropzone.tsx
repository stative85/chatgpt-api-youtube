import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export const FileDropzone = ({ onFileSelect, isProcessing }: FileDropzoneProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt', '.md'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    disabled: isProcessing,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300',
        isDragActive ? 'border-indigo-400 bg-indigo-500/10 scale-[1.02]' : 'border-slate-700 hover:border-indigo-400/80',
        isProcessing ? 'opacity-50 pointer-events-none' : ''
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 bg-slate-800 rounded-full">
          {isProcessing ? (
            <Loader2 className="w-8 h-8 text-indigo-300 animate-spin" />
          ) : (
            <UploadCloud className="w-8 h-8 text-indigo-300" />
          )}
        </div>
        <div className="space-y-1">
          <p className="text-xl font-semibold tracking-tight">
            {isDragActive ? 'Drop to analyze' : 'Upload your text'}
          </p>
          <p className="text-sm text-slate-400 max-w-xs mx-auto">
            Support for PDF, DOCX, and TXT. Our AI will restructure it for Suno.
          </p>
        </div>
      </div>
    </div>
  );
};
