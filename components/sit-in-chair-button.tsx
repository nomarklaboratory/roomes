import { Icon } from "./icon";

interface SitInChairButtonProps {
  onSit: () => void;
  label?: string;
}

export function SitInChairButton({
  onSit,
  label = "Sit in chair",
}: SitInChairButtonProps) {
  return (
    <button
      className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#c1d999] bg-[#d9efad] px-3 text-[11px] text-[#395334] hover:bg-[#c8e494]"
      onClick={onSit}
    >
      <Icon name="chair" size={16} /> {label}
    </button>
  );
}
