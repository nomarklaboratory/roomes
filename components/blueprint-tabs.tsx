import { cn } from "@/lib/cn";
import type { BlueprintView, BlueprintViewId } from "@/types/blueprint";

export function BlueprintTabs({
  views,
  selected,
  onChange,
}: {
  views: BlueprintView[];
  selected: BlueprintViewId;
  onChange: (id: BlueprintViewId) => void;
}) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="tablist"
      aria-label="Blueprint views"
    >
      {views.map((view, index) => (
        <button
          key={view.id}
          type="button"
          role="tab"
          id={`blueprint-tab-${view.id}`}
          aria-selected={selected === view.id}
          aria-controls="blueprint-drawing"
          tabIndex={selected === view.id ? 0 : -1}
          onClick={() => onChange(view.id)}
          onKeyDown={(event) => {
            const direction = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
            let next = index;
            if (direction)
              next = (index + direction + views.length) % views.length;
            else if (event.key === "Home") next = 0;
            else if (event.key === "End") next = views.length - 1;
            else return;
            event.preventDefault();
            onChange(views[next].id);
            event.currentTarget.parentElement
              ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
              [next]?.focus();
          }}
          className={cn(
            "min-h-11 rounded-xl border border-[#dce3d4] px-4 text-base text-[#3f583b]",
            selected === view.id && "border-[#3f583b] bg-[#3f583b] text-white",
          )}
        >
          {view.title}
        </button>
      ))}
    </div>
  );
}
