import { useState } from 'react';
import { FileDropzone } from './components/file-dropzone';
import { SongCard } from './components/song-card';
import { JsonPreview } from './components/json-preview';
import { SongPackage } from './types/schema';
import { useSunoApi } from './hooks/use-suno-api';

const App = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { isProcessing, data, error, processFile } = useSunoApi();

  const handleSelect = (file: File) => {
    setSelectedFile(file);
    processFile(file);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold">SunoForge</h1>
          <p className="text-slate-300">
            Transform raw text into Suno-ready song packages.
          </p>
        </header>

        <FileDropzone onFileSelect={handleSelect} isProcessing={isProcessing} />

        {selectedFile && !data && !error && (
          <div className="text-sm text-slate-400">Processing {selectedFile.name}...</div>
        )}

        {error && (
          <div className="bg-red-900/40 border border-red-500 text-red-100 p-4 rounded-lg">
            {error}
          </div>
        )}

        {data && (
          <>
            <SongCard data={data as SongPackage} />
            <JsonPreview data={data as SongPackage} />
          </>
        )}
      </div>
    </div>
  );
};

export default App;
