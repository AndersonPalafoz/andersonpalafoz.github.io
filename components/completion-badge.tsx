import { CheckCircle2 } from "lucide-react";

interface CompletionBadgeProps {
  completed: boolean;
  percentage?: number;
  size?: "sm" | "md" | "lg";
}

export function CompletionBadge({
  completed,
  percentage = 0,
  size = "md",
}: CompletionBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20,
  };

  if (completed) {
    return (
      <div
        className={`flex items-center gap-2 bg-green-100 text-green-700 rounded-full font-medium ${sizeClasses[size]}`}
      >
        <CheckCircle2 size={iconSizes[size]} />
        Curso Concluído
      </div>
    );
  }

  if (percentage > 0) {
    return (
      <div
        className={`flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full font-medium ${sizeClasses[size]}`}
      >
        <span className="w-4 h-4 rounded-full bg-blue-700 text-white text-xs flex items-center justify-center">
          {Math.round(percentage)}%
        </span>
        Em Progresso
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 bg-gray-100 text-gray-700 rounded-full font-medium ${sizeClasses[size]}`}
    >
      <span className="w-4 h-4 rounded-full bg-gray-300" />
      Não Iniciado
    </div>
  );
}
