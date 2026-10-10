import { catalog, finishes } from "@/lib/catalog";
import { type Setup } from "@/lib/workspace";
import { positionOf } from "@/lib/placement";
export function RoomFallback({
  setup,
  loading = false,
}: {
  setup: Setup;
  loading?: boolean;
}) {
  const finish = finishes.find((f) => f.id === setup.finish)!.color;
  const desk = setup.layout.desk;
  const chair = setup.layout.chair;
  const project = (x: number, z: number) => [145 * (x - z), 66 * x + 75 * z];
  const [deskX, deskY] = project(desk.x, desk.z + 0.43);
  const [chairX, chairY] = project(chair.x - 0.16, chair.z - 0.35);
  return (
    <div
      className="room-fallback"
      role="img"
      aria-label={`${catalog[setup.deskId].name}, ${catalog[setup.chairId].name}, and ${setup.items.length} accessories in your workspace`}
    >
      <svg viewBox="0 0 700 500" aria-hidden="true">
        <path fill="#ddd9ca" d="m90 320 270-140 250 120-255 152z" />
        <path fill="#eeeee3" d="M90 320V92l270-60v148z" />
        <path fill="#e1e6d6" d="M360 32 610 140v160L360 180z" />
        <path
          fill="#d5e4e0"
          stroke="#fbfaf2"
          strokeWidth="12"
          d="m140 120 134-30v130l-134 45z"
        />
        <g transform={`translate(${deskX} ${deskY})`}>
          <path
            fill={finish}
            d={
              setup.deskId === "wooden-desk"
                ? "m195 290 180-90 145 65-185 95z"
                : "m220 282 145-74 120 52-150 78z"
            }
          />
          <path stroke="#b6b8ae" strokeWidth="13" d="M237 292v90m220-112v91" />
          {setup.items.map((item) => {
            const p = positionOf(setup, item.id);
            const [x, y] = project(p.x, p.z);
            return catalog[item.productId].kind === "monitor" ? (
              <g key={item.id} transform={`translate(${330 + x} ${205 + y})`}>
                <path fill="#303e37" d="m-30-20 70 24v65l-70-24z" />
                <path
                  stroke="#b8c986"
                  strokeWidth="4"
                  d="m-21-4 50 17m-50-6 25 9"
                />
                <path stroke="#888d7e" strokeWidth="6" d="M5 56v18" />
              </g>
            ) : (
              <g key={item.id} transform={`translate(${335 + x} ${275 + y})`}>
                {catalog[item.productId].kind === "plant" ? (
                  <>
                    <path fill="#b87b58" d="m-8 0 22 8-3 22-18-8z" />
                    <path
                      stroke="#5f8257"
                      strokeWidth="7"
                      d="M2 6v-30m0 12-16-11m16 19 16-13"
                    />
                  </>
                ) : catalog[item.productId].kind === "lamp" ? (
                  <>
                    <path
                      stroke="#526b54"
                      strokeWidth="5"
                      d="M0 12v-36l14-11"
                    />
                    <path fill="#738361" d="m9-41 17 6-3 12-19-5z" />
                  </>
                ) : (
                  <path
                    stroke="#87918b"
                    strokeWidth="7"
                    d="m0 0 25-7 0 16-25 7z"
                  />
                )}
              </g>
            );
          })}
        </g>
        <g transform={`translate(${360 + chairX} ${328 + chairY})`}>
          <path
            fill={setup.chairId === "task-chair" ? "#829179" : "#39463d"}
            d="M-37-30Q-40-90 12-76q25 10 20 65z"
          />
          <path fill="#5f6b60" d="m-38-29 64 12 25 23-63 5z" />
          <path
            stroke="#525e53"
            strokeWidth="7"
            d="M0 9v57m-27 5 27-12 33 11M0 59l-5 25"
          />
        </g>
      </svg>
      <span>
        {loading
          ? "Setting the scene…"
          : "2D preview · 3D is unavailable on this device"}
      </span>
    </div>
  );
}
