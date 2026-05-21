import { useMemo } from "react";
import { FileSpreadsheet, Eye, ChevronRight } from "lucide-react";
import { CsvPreviewData } from "../types";

interface CsvTablePreviewProps {
  csvText: string;
}

// 健壯的 CSV 語法解析器 (支援雙引號、欄位中包含逗號等語法)
export function parseCsv(text: string): CsvPreviewData {
  if (!text || text.trim() === "") {
    return { headers: [], rows: [] };
  }

  const lines: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let currentValue = "";

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentValue += '"';
        i++; // 略過雙引號轉義
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      row.push(currentValue.trim());
      currentValue = "";
    } else if ((char === "\r" || char === "\n") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i++;
      }
      row.push(currentValue.trim());
      lines.push(row);
      row = [];
      currentValue = "";
    } else {
      currentValue += char;
    }
  }

  if (row.length > 0 || currentValue !== "") {
    row.push(currentValue.trim());
    lines.push(row);
  }

  // 排除完全空白的列
  const validLines = lines.filter((l) => l.length > 0 && l.some((cell) => cell !== ""));
  if (validLines.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = validLines[0].map((h, idx) => h || `欄位 ${idx + 1}`);
  let rows = validLines.slice(1);

  // 確保每一列與 header 具有同等欄數
  rows = rows.map((r) => {
    if (r.length < headers.length) {
      return [...r, ...Array(headers.length - r.length).fill("")];
    } else if (r.length > headers.length) {
      return r.slice(0, headers.length);
    }
    return r;
  });

  return { headers, rows };
}

export default function CsvTablePreview({ csvText }: CsvTablePreviewProps) {
  const { headers, rows } = useMemo(() => parseCsv(csvText), [csvText]);

  if (!csvText || csvText.trim() === "" || headers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-slate-800 rounded-3xl bg-slate-900/10 text-slate-400">
        <FileSpreadsheet className="w-12 h-12 mb-3 text-slate-700 stroke-[1.2] animate-pulse" />
        <p className="text-sm font-semibold text-slate-400">尚未輸入 / 載入任何 CSV 數據資料</p>
        <p className="text-xs text-slate-500 mt-1 max-w-[280px] text-center leading-relaxed">選取上方範例數據，或直接在左側拖曳/貼上表格檔案後將在此即時預覽數據</p>
      </div>
    );
  }

  // 為了防止海量數據導致 DOM 渲染卡頓，上限只預覽前 10 筆
  const MAX_PREVIEW_ROWS = 10;
  const slicedRows = rows.slice(0, MAX_PREVIEW_ROWS);
  const remainingCount = rows.length - MAX_PREVIEW_ROWS;

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-200">
          <Eye className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold tracking-tight uppercase">數據表格視覺化預覽</h3>
        </div>
        <span className="text-xs px-3 py-1 font-semibold bg-emerald-950/40 text-emerald-400 rounded-full border border-emerald-900/60">
          共 {rows.length} 筆資料 · {headers.length} 個欄位
        </span>
      </div>

      <div className="border border-slate-800 rounded-2xl bg-slate-950 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto max-h-[360px] scrollbar-thin">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 sticky top-0 backdrop-blur-sm">
                {headers.map((hdr, idx) => (
                  <th key={idx} className="p-3.5 font-bold text-slate-300 border-r border-slate-800/80 last:border-0 leading-normal">
                    {hdr}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slicedRows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className="border-b border-slate-850/60 hover:bg-slate-900/60 transition-colors"
                >
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="p-3.5 text-slate-300 border-r border-slate-850/40 last:border-0 font-medium truncate max-w-[200px]">
                      {cell === "" ? <span className="text-slate-605 font-normal italic">無</span> : cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {remainingCount > 0 && (
          <div className="flex items-center justify-between p-3.5 bg-slate-900/40 border-t border-slate-800 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-slate-400">
              <ChevronRight className="w-4 h-4 text-slate-500" />
              已為您自動預覽前 {MAX_PREVIEW_ROWS} 筆記錄 (其餘 {remainingCount} 筆已被收摺)
            </span>
            <span className="bg-slate-850 text-slate-300 font-bold px-2.5 py-1 rounded-md border border-slate-800">
              AI 仍將深入解析完整 {rows.length} 筆數據
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
