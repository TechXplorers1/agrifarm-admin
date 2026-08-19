import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
}

export function Spinner({ className, size = 24, ...props }: SpinnerProps) {
  return (
    <div className={cn("flex justify-center items-center p-8", className)} {...props}>
      <Loader2 className="animate-spin text-primary" size={size} />
    </div>
  );
}
