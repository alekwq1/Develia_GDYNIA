import { useEffect, useState } from "react";

export function useSplatLoader(url: string) {
  const [progress, setProgress] = useState(0);
  const [showLoading, setShowLoading] = useState(true);
  const [loadedData, setLoadedData] = useState<Blob | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    setShowLoading(true);
    const downloadFile = async (url: string) => {
      try {
        const response = await fetch(url);
        const reader = response.body?.getReader();
        const contentLength = response.headers.get("content-length");
        let receivedLength = 0;
        const chunks: Uint8Array[] = [];
        if (!contentLength) return;
        const totalLength = parseInt(contentLength, 10);
        while (receivedLength < totalLength) {
          const { done, value } = (await reader?.read()) ?? {};
          if (done) break;
          if (value) {
            chunks.push(value);
            receivedLength += value.length;
            setProgress(Math.round((receivedLength / totalLength) * 100));
          }
        }
        const blob = new Blob(chunks);
        setLoadedData(blob);
        setProgress(100);
        setTimeout(() => setShowLoading(false), 800);
      } catch (error) {
        setShowLoading(false);
        setProgress(100);
        console.error("Error loading splat:", error);
      }
    };
    downloadFile(url);
  }, [url]);

  useEffect(() => {
    let url: string | null = null;
    if (loadedData) {
      url = URL.createObjectURL(loadedData);
      setObjectUrl(url);
    }
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [loadedData]);

  return { objectUrl, progress, showLoading };
}
