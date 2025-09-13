export function parseEnumParam<T extends readonly string[]>(
  param: string | null,
  allowed: T,
): T[number] | null {
  if (param && (allowed as readonly string[]).includes(param)) {
    return param as T[number];
  }
  return null;
}
