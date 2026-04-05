import { useState } from "react";
import { useTranslatePost } from "../hooks/useApi";

interface TranslateButtonProps {
  postId: number;
  onTranslate?: () => Promise<void>;
  isTranslated?: boolean;
}

export default function TranslateButton({
  postId,
  onTranslate,
  isTranslated = false,
}: TranslateButtonProps) {
  const { translate, loading, error } = useTranslatePost();
  const [translated, setTranslated] = useState(isTranslated);

  async function handleClick() {
    if (translated) return;
    try {
      await translate(postId, 'es');
      setTranslated(true);
      await onTranslate?.();
    } catch (err) {
      // Error handled by hook
    }
  }

  if (translated) {
    return (
      <span className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-gray-500">
        ✓ Translated
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
