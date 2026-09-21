"use client";

import { useEffect, useState } from "react";
import { fetchRecordingObjectUrl } from "@/lib/api/recordings";

export function InlineAudioPlayer({ inputId }: { inputId: string }) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let url: string | null = null;

    fetchRecordingObjectUrl(inputId)
      .then((u) => {
        if (cancelled) {
          URL.revokeObjectURL(u);
          return;
        }
        url = u;
        setObjectUrl(u);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load this recording.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [inputId]);

  if (isLoading) {
    return <p className="text-xs text-muted">Loading audio…</p>;
  }

  if (error || !objectUrl) {
    return <p className="text-xs text-danger">{error ?? "No recording found."}</p>;
  }

  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <audio controls src={objectUrl} className="h-9 w-full max-w-sm" />
  );
}
