"use client";

interface PositionPreview {
  attributes: Record<string, string>;
  name: string;
  sku: string;
}

interface MatrixPreviewTableProps {
  positions: PositionPreview[];
}

export function MatrixPreviewTable({ positions }: MatrixPreviewTableProps) {
  if (positions.length === 0) return null;

  if (positions.length > 50) {
    return (
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-center">
        <p className="text-amber-800">
          Будет создано {positions.length} позиций. Предпросмотр
          скрыт для большого количества.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="font-bold text-slate-900">
        Предварительный просмотр ({positions.length} позиций)
      </h4>
      <div className="rounded-xl border border-slate-200 overflow-hidden">
        <table className="crm-table w-full text-left">
          <thead>
            <tr>
              <th className="w-12 px-4 py-3 text-xs font-bold text-slate-500 bg-slate-50">#</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 bg-slate-50">Название</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 bg-slate-50">SKU</th>
            </tr>
          </thead>
          <tbody>
            {positions.slice(0, 20).map((pos, index) => (
              <tr key={index} className="border-b border-slate-100 last:border-0">
                <td className="font-mono text-slate-500 px-4 py-3">
                  {index + 1}
                </td>
                <td className="font-medium px-4 py-3">{pos.name}</td>
                <td className="font-mono text-sm text-slate-600 px-4 py-3">
                  {pos.sku}
                </td>
              </tr>
            ))}
            {positions.length > 20 && (
              <tr>
                <td
                  colSpan={3}
                  className="text-center text-slate-500 px-4 py-3"
                >
                  ... и ещё {positions.length - 20} позиций
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
