/**
 * Line 1 = offer, line 2+ = audience (split on first newline only).
 * Do not trim while editing — spaces and trailing spaces must survive each keystroke.
 */
export function formatPitch(offerOneLiner: string, audienceOneLiner: string): string {
  if (audienceOneLiner.length === 0) {
    return offerOneLiner;
  }
  return `${offerOneLiner}\n${audienceOneLiner}`;
}

export function parsePitch(text: string): {
  offerOneLiner: string;
  audienceOneLiner: string;
} {
  const i = text.indexOf("\n");
  if (i === -1) {
    return { offerOneLiner: text, audienceOneLiner: "" };
  }
  return {
    offerOneLiner: text.slice(0, i),
    audienceOneLiner: text.slice(i + 1),
  };
}

export function scopeLinesToText(lines: string[]): string {
  return lines.join("\n");
}

export function textToScopeLines(text: string): string[] {
  return text.split("\n").map((l) => l.trimEnd());
}
