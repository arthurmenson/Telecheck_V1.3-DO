export const redact = (s: string) =>
  s.replace(
    /\b(\d{3}-\d{2}-\d{4}|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/g,
    "***",
  );
