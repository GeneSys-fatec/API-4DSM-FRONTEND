export function loadStoredFilters<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }

    return {
      ...fallback,
      ...(JSON.parse(raw) as Partial<T>),
    };
  } catch {
    return fallback;
  }
}

export function persistFilters<T>(key: string, value: T): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}
