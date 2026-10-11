import { diagramGeometry } from "@/lib/blueprint-diagram";
import { measurementText } from "@/lib/blueprint";
import type { BlueprintView } from "@/types/blueprint";

export function BlueprintMap({
  view,
  selected,
  onSelect,
}: {
  view: BlueprintView;
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const { scale, x, y, width, height } = diagramGeometry(view);
  const chosen = view.footprints.find(
    (footprint) => footprint.item.id === selected,
  );
  return (
    <svg
      viewBox="0 0 960 620"
      className="w-full min-w-[40rem] text-[#40583d]"
      role="group"
      aria-label={`${view.title}, measurements in centimetres`}
    >
      <title>{view.title}</title>
      <desc>
        Numbered product footprints. Choose a product to see its distances. All
        measurements are in centimetres.
      </desc>
      <defs>
        <pattern
          id={`grid-${view.id}`}
          width={Math.max(20, 10 * scale)}
          height={Math.max(20, 10 * scale)}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${Math.max(20, 10 * scale)} 0 H 0 V ${Math.max(20, 10 * scale)}`}
            fill="none"
            stroke="#e4e8df"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={`url(#grid-${view.id})`}
        stroke="#708568"
        strokeWidth="3"
      />
      <path
        d={`M${x} ${y - 14}V${y - 42}H${x + width}V${y - 14}`}
        fill="none"
        stroke="#708568"
        strokeWidth="2"
      />
      <text
        x={x + width / 2}
        y={y - 54}
        textAnchor="middle"
        fontSize="24"
        fill="currentColor"
      >
        {measurementText(view.width)}
      </text>
      <path
        d={`M${x - 14} ${y}H${x - 42}V${y + height}H${x - 14}`}
        fill="none"
        stroke="#708568"
        strokeWidth="2"
      />
      <text
        x={x - 54}
        y={y + height / 2}
        textAnchor="middle"
        fontSize="24"
        fill="currentColor"
        transform={`rotate(-90 ${x - 54} ${y + height / 2})`}
      >
        {measurementText(view.height)}
      </text>
      <text
        x={x + width / 2}
        y={y + height + 42}
        textAnchor="middle"
        fontSize="24"
        fill="currentColor"
      >
        {view.id === "wall" ? "Floor" : "Front"}
      </text>
      {view.footprints.map((footprint) => {
        const px = x + footprint.x * scale;
        const py = y + footprint.y * scale;
        const w = footprint.width * scale;
        const h = footprint.height * scale;
        const active = selected === footprint.item.id;
        return (
          <g
            key={footprint.item.id}
            role="button"
            tabIndex={0}
            aria-label={`Item ${footprint.item.number}: ${footprint.item.name}`}
            aria-pressed={active}
            className="cursor-pointer outline-none focus-visible:[&_rect]:stroke-[#172d19] focus-visible:[&_rect]:stroke-[4]"
            onClick={() => onSelect(footprint.item.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect(footprint.item.id);
              }
            }}
          >
            <rect
              x={px}
              y={py}
              width={w}
              height={h}
              rx={footprint.item.id === "chair" ? 12 : 3}
              fill={active ? "#d9e8c8" : "#eef2e8"}
              stroke={active ? "#3d653c" : "#8a9c7e"}
              strokeWidth={active ? 4 : 2}
            />
            {footprint.facing && (
              <path
                d={
                  footprint.facing === "up"
                    ? `M${px + w / 2 - 9} ${py + 18}l9-10 9 10`
                    : `M${px + w / 2 - 9} ${py + h - 18}l9 10 9-10`
                }
                fill="none"
                stroke="#6e8263"
                strokeWidth="3"
              />
            )}
            <circle
              cx={px + w / 2}
              cy={py + h / 2}
              r="19"
              fill={active ? "#3f583b" : "#fff"}
              stroke="#6e8263"
            />
            <text
              x={px + w / 2}
              y={py + h / 2 + 8}
              textAnchor="middle"
              fontSize="24"
              fill={active ? "#fff" : "#40583d"}
            >
              {footprint.item.number}
            </text>
          </g>
        );
      })}
      {chosen && (
        <>
          <path
            d={`M${x} ${y + chosen.y * scale + (chosen.height * scale) / 2}H${x + chosen.x * scale}`}
            stroke="#3f583b"
            strokeWidth="3"
            strokeDasharray="8 5"
          />
          <path
            d={`M${x + chosen.x * scale + (chosen.width * scale) / 2} ${view.id === "wall" ? y + height : y}V${y + (view.id === "wall" ? chosen.y + chosen.height : chosen.y) * scale}`}
            stroke="#3f583b"
            strokeWidth="3"
            strokeDasharray="8 5"
          />
        </>
      )}
    </svg>
  );
}
