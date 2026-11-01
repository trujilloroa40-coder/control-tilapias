type CsvValue = string | number | boolean | null | undefined;

function escapeCell(value: CsvValue) {
  if (value === null || value === undefined) {
    return "";
  }

  const cell = String(value);

  if (/[",\r\n]/.test(cell)) {
    return `"${cell.replaceAll('"', '""')}"`;
  }

  return cell;
}

export function toCsv<T extends Record<string, CsvValue>>(
  rows: T[],
  columns: Array<{ key: string; label: string }>,
) {
  const header = columns.map((column) => escapeCell(column.label)).join(",");
  const body = rows.map((row) =>
    columns.map((column) => escapeCell(row[column.key])).join(","),
  );

  return [header, ...body].join("\r\n");
}

export function csvResponse(filename: string, csv: string) {
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
    },
  });
}
