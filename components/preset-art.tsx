export function PresetArt({ index }: { index: number }) {
  return (
    <svg viewBox="0 0 90 72" aria-hidden="true">
      <path
        fill={["#e0d6ba", "#b8c7a7", "#d6b69b"][index]}
        d="M10 42V9l37-5 33 16v28L43 63z"
      />
      <path fill="#ece4d2" d="m10 42 33-18 37 24-37 19z" />
      <path
        fill={["#c6a780", "#b99973", "#82553d"][index]}
        d="m24 35 24-12 24 11-24 13z"
      />
      <path stroke="#767e6a" strokeWidth="3" d="M27 38v15m40-15v14" />
      {index > 0 && <path fill="#344d3e" d="m43 19 16 6v12l-16-6z" />}
      <path
        fill={index === 1 ? "#485743" : "#8c9c7e"}
        d="M40 40q-6-12 4-14 12 3 7 17l-11 5z"
      />
      <path stroke="#54624d" strokeWidth="2" d="m44 45 1 12-7 3m7-3 9 3" />
      <path fill="#bfd2c9" d="m14 14 14-3v17l-14 6z" />
      {index === 2 && (
        <path fill="#5f7851" d="M66 31v-6l-5-4 2-3 5 4 3-5 3 3-5 6v7z" />
      )}
    </svg>
  );
}
