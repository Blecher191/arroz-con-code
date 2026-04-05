import { useState } from "react";
import { useTranslatePost } from "../hooks/useApi";

interface TranslateButtonProps {
  postId: number;
  isTranslated?: boolean;
  onTranslate?: () => Promise<void>;
  onTranslated?: (body: string) => void;
}

export default function TranslateButton({
  postId,
  isTranslated = false,
  onTranslate,
  onTranslated,
}: TranslateButtonProps) {
  const { translate, loading, error } = useTranslatePost();
  const [translated, setTranslated] = useState(isTranslated);

  async function handleClick() {
    if (translated) return;
    try {
      const result = await translate(postId, "es");
      setTranslated(true);
      if (result && onTranslated) {
        onTranslated(result.translatedText);
      }
      await onTranslate?.();
    } catch {
      // error handled by hook
    }
  }

  if (translated) {
    return (
      <span className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-gray-500">
        ✓ Translated to Spanish
      </span>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-50"
      title={error ? "Translation failed" : "Translate to Spanish"}
    >
      <span>🌐</span>
      {loading ? "Translating..." : "Translate"}
      {error && <span className="text-red-600">✕</span>}
    </button>
  );
}
