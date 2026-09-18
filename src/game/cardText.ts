// Break only at authored word boundaries. Native one-line fitting handles each
// resulting line without allowing iOS/Android to wrap inside a word.
export function cardTextLines(label: string): string[] {
  const words = label.trim().split(/\s+/u);
  if (words.length < 2) return [label];
  let split = 1; let best = Infinity;
  for (let i = 1; i < words.length; i++) {
    const width = Math.max(words.slice(0, i).join(' ').length, words.slice(i).join(' ').length);
    if (width < best) { best = width; split = i; }
  }
  return [words.slice(0, split).join(' '), words.slice(split).join(' ')];
}
