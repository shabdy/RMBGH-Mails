import rmbghLogo from "@/assets/rmbghlogo.png";
import { cn } from "@/lib/utils";

function Spinner({ className, size = 20, ...props }) {
  return (
    <img
      src={rmbghLogo}
      role="status"
      aria-label="Loading"
      style={{ width: size, height: size }}
      className={cn("animate-spin object-contain", className)}
      {...props}
    />
  );
}

export { Spinner };
