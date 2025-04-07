/**
 * Formats a string for OFX output by escaping special characters
 * @param str The string to format
 * @returns The formatted string with special characters escaped
 */
export function formatString(str: string): string {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

/**
 * Formats a label string for OFX output by replacing spaces with underscores and adding a hash prefix
 * @param label The label to format
 * @returns The formatted label
 */
export function formatLabel(label: string): string {
  return `#${label.replaceAll(" ", "_")}`;
}

/**
 * Formats multiple labels for OFX output
 * @param labels Comma-separated list of labels
 * @returns Space-separated list of formatted labels
 */
export function formatLabels(labels: string): string {
  return labels
    .split(",")
    .map((label) => formatLabel(label))
    .join(" ");
}
