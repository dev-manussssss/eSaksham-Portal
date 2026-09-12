/**
 * DataTable — reusable table component.
 * columns: [{ key, label, render? }]
 * rows: array of data objects
 */
export default function DataTable({ columns, rows, loading = false, emptyMessage = 'No records found.' }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-text-muted">
        <span className="material-symbols-outlined animate-spin mr-2" style={{ fontSize: 20 }}>autorenew</span>
        <span style={{ fontSize: 14 }}>Loading...</span>
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-text-muted gap-2">
        <span className="material-symbols-outlined" style={{ fontSize: 40, opacity: 0.4 }}>inbox</span>
        <p style={{ fontSize: 14 }}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <table className="w-full saksham-table min-w-[640px]">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={col.className || ''}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id || i} className="group cursor-default">
              {columns.map((col) => (
                <td key={col.key} className={col.tdClassName || ''}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
