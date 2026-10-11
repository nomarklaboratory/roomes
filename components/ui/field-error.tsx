export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 text-base leading-relaxed text-red-700">
      {message}
    </p>
  );
}
