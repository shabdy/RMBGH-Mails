const COLORS = ["bg-blue-500", "bg-violet-500", "bg-green-500", "bg-amber-500", "bg-pink-500", "bg-teal-500"];

export function Avatar({ name, size = "md" }) {
  const initials = (name || "?").split(" ").map((w) => w[0] || "").slice(0, 2).join("").toUpperCase() || "?";
  const color = COLORS[(name || "").charCodeAt(0) % COLORS.length];
  const sz = size === "sm" ? "w-7 h-7 text-[10px]" : size === "lg" ? "w-10 h-10 text-sm" : "w-9 h-9 text-xs";
  return (
    <div className={`${sz} rounded-full ${color} text-white font-semibold flex items-center justify-center flex-shrink-0`}>
      {initials}
    </div>
  );
}
