// 간단한 CSV 직렬화. Excel에서 한글이 깨지지 않도록 UTF-8 BOM을 붙인다.

const BOM = String.fromCharCode(0xfeff);

function escapeCell(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function toCsv(headers: string[], rows: string[][]): string {
  const lines = [headers, ...rows].map((cells) => cells.map(escapeCell).join(","));
  return BOM + lines.join("\r\n") + "\r\n";
}
