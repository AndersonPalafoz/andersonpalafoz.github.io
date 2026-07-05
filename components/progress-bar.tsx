interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = true,
}: ProgressBarProps) {
  const percentage = (value / max) * 100;

  return (
    <div className="w-full space-y-2">
      {label && <p className="text-sm font-medium text-gray-300">{label}</p>}
      <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
        <div
          className="bg-red-600 h-full rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && (
        <p className="text-xs text-gray-400 text-right">
          {Math.round(percentage)}%
        </p>
      )}
    </div>
  );
}
