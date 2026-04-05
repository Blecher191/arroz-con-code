/**
 * FactCheckBadge Component
 * Displays Gemini fact-check results with color coding
 */

interface FactCheckBadgeProps {
  status?: 'verified' | 'misleading' | 'false' | 'unverifiable';
  confidenceScore?: number;
  loading?: boolean;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: string; label: string }> = {
  verified: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    icon: '✓',
    label: 'Verified',
  },
  misleading: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    icon: '⚠',
    label: 'Misleading',
  },
  false: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    icon: '✕',
    label: 'False',
  },
  unverifiable: {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    icon: '?',
    label: 'Unverifiable',
  },
};

export default function FactCheckBadge({
  status,
  confidenceScore,
  loading,
}: FactCheckBadgeProps) {
  if (loading) {
    return (
      <div className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
        <span className="animate-spin">⟳</span>
        Checking...
      </div>
    );
  }

  if (!status) {
    return null;
  }

  const config = STATUS_CONFIG[status];

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}
      title={
        confidenceScore
          ? `${config.label} (${Math.round(confidenceScore * 100)}% confidence)`
          : config.label
      }
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
      {confidenceScore && (
        <span className="ml-0.5 text-xs opacity-75">
          {Math.round(confidenceScore * 100)}%
        </span>
      )}
    </div>
  );
}
