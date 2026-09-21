export function formatArea(hectares: number | null | undefined): string {
  if (hectares == null) return "—";
  if (hectares < 100) return `${hectares.toLocaleString(undefined, { maximumFractionDigits: 2 })} ha`;
  const km2 = hectares / 100;
  return `${km2.toLocaleString(undefined, { maximumFractionDigits: 2 })} km²`;
}

export function formatAreaDual(hectares: number | null | undefined): string {
  if (hectares == null) return "—";
  const km2 = hectares / 100;
  const acres = hectares * 2.47105;
  if (hectares < 100) {
    return `${hectares.toLocaleString(undefined, { maximumFractionDigits: 2 })} ha (${acres.toLocaleString(undefined, {
      maximumFractionDigits: 1,
    })} acres)`;
  }
  return `${km2.toLocaleString(undefined, { maximumFractionDigits: 2 })} km² (${hectares.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })} ha)`;
}

export function formatCoord(v: number | null | undefined, digits = 4): string {
  if (v == null) return "—";
  return `${v.toFixed(digits)}°`;
}
