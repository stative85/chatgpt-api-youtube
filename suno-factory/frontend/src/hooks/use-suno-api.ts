import { useState } from 'react';
import { SongPackage } from '@/types/schema';

export const useSunoApi = () => {
  const [data, setData] = useState<SongPackage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = async (file: File, instructions?: string) => {
    setIsProcessing(true);
    setError(null);
    setData(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (instructions) {
        formData.append('instructions', instructions);
      }

      const response = await fetch('http://localhost:8000/api/v1/process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Failed to process file.');
      }

      const payload = (await response.json()) as SongPackage;
      setData(payload);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unexpected error';
      setError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return { data, error, isProcessing, processFile };
};
