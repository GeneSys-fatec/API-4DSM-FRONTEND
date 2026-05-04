export interface ExportDateRange {
  from?: string;
  to?: string;
}

export function parseRowDateTime(value: unknown): Date | null {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\u00A0/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/[‐‑–—−]/g, "-")
    .trim()
    .replace(/\s+/g, " ");

  if (!normalized) {
    return null;
  }

  const isoLikeMatch = normalized.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/,
  );
  if (isoLikeMatch) {
    const [, year, month, day, hour = "00", minute = "00", second = "00"] = isoLikeMatch;
    const parsed = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
    );

    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return parsed;
  }

  const brMatch = normalized.match(
    /^(\d{2})\/(\d{2})\/(\d{4})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/,
  );
  if (brMatch) {
    const [, day, month, year, hour = "00", minute = "00", second = "00"] = brMatch;
    const parsed = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
    );

    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return parsed;
  }

  const fallback = new Date(normalized.replace(" ", "T"));
  if (Number.isNaN(fallback.getTime())) {
    return null;
  }

  return fallback;
}

export function parseBoundaryDate(dateValue: string | undefined, mode: "start" | "end"): Date | null {
  if (!dateValue) {
    return null;
  }

  const suffix = mode === "start" ? "T00:00:00" : "T23:59:59.999";
  const parsed = new Date(`${dateValue}${suffix}`);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

export function shouldIncludeRowByDate(rowDate: unknown, range: ExportDateRange): boolean {
  const hasFrom = Boolean(range.from);
  const hasTo = Boolean(range.to);

  if (!hasFrom && !hasTo) {
    return true;
  }

  const parsedRowDate = parseRowDateTime(rowDate);
  if (!parsedRowDate) {
    return false;
  }

  const fromDate = parseBoundaryDate(range.from, "start");
  const toDate = parseBoundaryDate(range.to, "end");

  if (fromDate && parsedRowDate < fromDate) {
    return false;
  }

  if (toDate && parsedRowDate > toDate) {
    return false;
  }

  return true;
}
