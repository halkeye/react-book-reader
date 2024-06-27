export function enumKeys<O extends object, K extends keyof O = keyof O>(
  object: O
): Array<K> {
  return Object.keys(object).filter((k) => !Number.isNaN(k)) as Array<K>;
}
