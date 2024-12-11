export function extractCString(
  bytes: Uint8Array,
  offset: number,
): { value: string; newIndex: number } {
  let index = offset;
  const chars: number[] = [];

  while (bytes[index] !== 0x00) {
    chars.push(bytes[index++]);
  }

  return { value: String.fromCharCode(...chars), newIndex: index + 1 };
}
