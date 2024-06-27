export function enumKeys<O extends object, K extends keyof O = keyof O>(
  obj: O
): Array<K> {
  return Object.keys(obj).filter((k) => !Number.isNaN(k)) as Array<K>;
}
