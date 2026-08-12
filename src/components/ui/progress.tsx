import { cn } from "../../lib/utils";

interface ProgressProps {
  className?: string;
  value: number;
}

export const Progress = ({ className, value }: ProgressProps) => (
  <div
    aria-label="Progresso do tutorial"
    aria-valuemax={100}
    aria-valuemin={0}
    aria-valuenow={Math.round(value)}
    className={cn("h-1.5 w-full overflow-hidden rounded-full bg-slate-200", className)}
    role="progressbar"
  >
    <div
      className="h-full rounded-full bg-blue-600 transition-[width] duration-300"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);
