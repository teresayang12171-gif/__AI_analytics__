import { useState, useEffect } from "react";
import Markdown from "react-markdown";
import { Copy, Check, Sparkles, Download, RefreshCw } from "lucide-react";

interface MarkdownOutputProps {
  content: string;
  onClear?: () => void;
  isGenerating?: boolean;
}

export default function MarkdownOutput({ content, onClear, isGenerating = false }: MarkdownOutputProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
    } catch (err) {
      console.error("複製失敗:", err);
    }
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleDownload = () => {
    if (!content) return;
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `AI_數據分析洞察報告-${new Date().toISOString().slice(0, 10)}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 border border-dashed border-slate-800 rounded-3xl bg-slate-900/10 text-slate-400 h-full min-h-[400px]">
        <div className="relative mb-5">
          <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-2xl scale-150 animate-pulse"></div>
          <div className="relative p-4 rounded-2xl bg-slate-900 border border-slate-800 text-emerald-400">
            <Sparkles className="w-8 h-8 animate-bounce" />
          </div>
        </div>
        <h3 className="text-base font-bold text-slate-200 mb-1.5 tracking-tight">AI 數據分析與洞察報告</h3>
        <p className="text-xs text-slate-400 text-center max-w-xs leading-relaxed">
          在左側貼上資料或載入範例，然後點擊「開始 AI 洞察分析」按鈕。Gemini 專家將在此即時產出全景解讀與精確商業建議！
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative transition-all duration-300">
      {/* 頂部標題與按鈕操作列 */}
      <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50"></div>
          <span className="font-bold text-sm text-slate-100 tracking-tight">AI 數據洞察分析報告</span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <button
            id="btn-copy-report"
            type="button"
            onClick={handleCopy}
            className={`cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold select-none transition-all duration-200 ${
              copied
                ? "bg-emerald-500 text-white border-emerald-600 shadow-lg shadow-emerald-500/20"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 active:scale-[0.98]"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>已複製報告</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>一鍵複製報告</span>
              </>
            )}
          </button>

          <button
            id="btn-download-report"
            type="button"
            onClick={handleDownload}
            title="下載 Markdown 報告"
            className="cursor-pointer p-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {onClear && (
            <button
              id="btn-clear-report"
              type="button"
              onClick={onClear}
              title="清除報告"
              className="cursor-pointer p-2 rounded-xl border border-slate-700 bg-slate-800 text-rose-400 hover:bg-rose-950/30 hover:border-rose-900 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 報告渲染區域 */}
      <div className="p-6 overflow-y-auto max-h-[740px] scrollbar-thin">
        <div className="markdown-container">
          <Markdown
            components={{
              h1: ({ ...props }) => (
                <h1 className="text-xl font-bold text-emerald-400 border-b border-slate-800 pb-2 mb-4 mt-6 first:mt-0 leading-snug font-sans tracking-tight" {...props} />
              ),
              h2: ({ ...props }) => (
                <h2 className="text-lg font-bold text-emerald-400 mb-3.5 mt-5.5 flex items-center gap-2 leading-tight font-sans tracking-tight" {...props} />
              ),
              h3: ({ ...props }) => (
                <h3 className="text-base font-bold text-slate-200 mb-2 mt-4.5 font-sans" {...props} />
              ),
              p: ({ ...props }) => (
                <p className="text-slate-300 leading-relaxed mb-4 text-sm font-medium" {...props} />
              ),
              ul: ({ ...props }) => (
                <ul className="list-disc pl-5.5 space-y-2 mb-4 text-slate-300 text-sm" {...props} />
              ),
              ol: ({ ...props }) => (
                <ol className="list-decimal pl-5.5 space-y-2 mb-4 text-slate-300 text-sm" {...props} />
              ),
              li: ({ ...props }) => (
                <li className="leading-relaxed list-item" {...props} />
              ),
              code: ({ ...props }) => (
                <code className="bg-slate-950 text-emerald-400 px-1.5 py-0.5 rounded-md font-mono text-xs font-semibold border border-slate-800" {...props} />
              ),
              table: ({ ...props }) => (
                <div className="overflow-x-auto my-4 border border-slate-800 rounded-xl">
                  <table className="w-full text-xs text-left border-collapse" {...props} />
                </div>
              ),
              thead: ({ ...props }) => (
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-200 font-bold" {...props} />
              ),
              tr: ({ ...props }) => (
                <tr className="border-b last:border-b-0 border-slate-800 hover:bg-slate-850/35 transition-colors" {...props} />
              ),
              th: ({ ...props }) => (
                <th className="p-3 font-semibold text-slate-200 border-r last:border-r-0 border-slate-800" {...props} />
              ),
              td: ({ ...props }) => (
                <td className="p-3 text-slate-300 border-r last:border-r-0 border-slate-800/50 font-medium" {...props} />
              ),
              blockquote: ({ ...props }) => (
                <blockquote className="border-l-4 border-emerald-500 pl-4 py-1 italic my-4.5 text-slate-300 bg-emerald-950/20 rounded-r-xl" {...props} />
              ),
            }}
          >
            {content}
          </Markdown>
        </div>
      </div>
    </div>
  );
}
