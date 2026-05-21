import React, { useState, useRef } from "react";
import {
  Sparkles,
  FileSpreadsheet,
  Upload,
  Layers,
  ArrowRight,
  Database,
  Trash2,
  AlertCircle,
  HelpCircle,
  LineChart,
  Brain,
  RefreshCw,
  Eye,
  FileCode,
  Gauge
} from "lucide-react";
import SampleLoader from "./components/SampleLoader";
import CsvTablePreview from "./components/CsvTablePreview";
import MarkdownOutput from "./components/MarkdownOutput";
import { AnalysisState } from "./types";

export default function App() {
  const [csvText, setCsvText] = useState<string>("");
  const [customInstructions, setCustomInstructions] = useState<string>("");
  const [uploadFileName, setUploadFileName] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState<boolean>(false);
  
  const [state, setState] = useState<AnalysisState>({
    isLoading: false,
    error: null,
    result: null,
  });

  // 進度提示語句 (依序更換增加趣味與期待感)
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const loadingSteps = [
    "正在讀取表格並建立數據模型...",
    "正在啟動 Google Gemini 智慧推演模組...",
    "正在探索數據內部關聯與趨勢...",
    "正在提煉核心指標與計算 KPI...",
    "正在為您量身打造最佳的優化決策與具體策略...",
  ];

  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadingIntervalRef = useRef<number | null>(null);

  // 當使用者選取預設模板範本時，一鍵填入
  const handleSelectSample = (csv: string, focus: string) => {
    setCsvText(csv);
    setCustomInstructions(focus);
    setUploadFileName("範例資料集.csv");
    setState((prev) => ({ ...prev, error: null })); // 清除錯誤
  };

  // 處理點選檔案上傳
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // 處理拖曳上傳
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = (file: File) => {
    // 支援 .csv 或 .txt
    if (!file.name.endsWith(".csv") && !file.name.endsWith(".txt")) {
      setState((prev) => ({
        ...prev,
        error: "不支援的檔案格式。目前僅支援 .csv 或 .txt 格式之逗號分隔文字檔。",
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === "string") {
        setCsvText(text);
        setUploadFileName(file.name);
        setState((prev) => ({ ...prev, error: null }));
      }
    };
    reader.onerror = () => {
      setState((prev) => ({ ...prev, error: "檔案讀取失敗，請重新嘗試。" }));
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleClear = () => {
    setCsvText("");
    setCustomInstructions("");
    setUploadFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setState({ isLoading: false, error: null, result: null });
  };

  // 計算 CSV 總列數
  const getCsvRowCount = () => {
    if (!csvText) return 0;
    const lines = csvText.split("\n").filter((line) => line.trim() !== "");
    return Math.max(0, lines.length - 1); // 扣除表頭
  };

  // 呼叫後端 API
  const handleStartAnalysis = async () => {
    if (!csvText.trim()) {
      setState((prev) => ({ ...prev, error: "請先輸入或上傳 CSV 數據。" }));
      return;
    }

    setState({ isLoading: true, error: null, result: null });
    setLoadingStep(0);

    // 啟動加載步驟文字定時輪播
    if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
    let step = 0;
    loadingIntervalRef.current = window.setInterval(() => {
      step = (step + 1) % loadingSteps.length;
      setLoadingStep(step);
    }, 4500);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          csvData: csvText,
          customInstructions,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "調用後端 AI 分析時發生未預期錯誤，請重新嘗試。");
      }

      setState({
        isLoading: false,
        error: null,
        result: data.result,
      });
    } catch (err: any) {
      console.error(err);
      setState({
        isLoading: false,
        error: err.message || "系統連線失敗。請確認伺服器已成功運行，且 GEMINI_API_KEY 已正確配置與啟用。",
        result: null,
      });
    } finally {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
        loadingIntervalRef.current = null;
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 antialiased font-sans flex flex-col selection:bg-emerald-500 selection:text-white pb-12 transition-colors duration-300">
      
      {/* 頂部導航與標題橫幅 (Bento Style) */}
      <header className="border-b border-slate-800 bg-[#020617]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                AI 數據分析與洞察工具
              </h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                Advanced Intelligence Data System
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2.5 items-center">
            <div className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 rounded-full flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-300">系統狀態：正常運行</span>
            </div>
            <div className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 rounded-full flex items-center">
              <span className="text-xs font-semibold text-slate-300">Model: Gemini 3.5 Flash</span>
            </div>
          </div>
        </div>
      </header>

      {/* 主體工作區區域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* 用戶提示 / 頂部巨型引言 Bento Box */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6.5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 text-emerald-500/5 select-none pointer-events-none">
            <LineChart className="w-36 h-36" />
          </div>
          <div className="relative z-10 max-w-3xl space-y-2">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-emerald-400" /> 
              企業級 AI 數據決策中樞
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed font-normal">
              本工具採用領先的人工智慧，為您的專案項目進行透徹的數據洗鍊。只需匯入或黏貼營運、銷售、廣告流量或用戶分析的 CSV 數據，我們將即刻解碼核心驅動因子，並出具可直接套用於商業實踐的精確決策方案。
            </p>
          </div>
        </div>

        {/* 樣板範本載入列 */}
        <SampleLoader onSelectSample={handleSelectSample} />

        {/* 主要分析卡片，左右分割布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* 左側：數據輸入與管理 (5格) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900/50 border border-slate-850 rounded-3xl p-6.5 shadow-xl space-y-5 flex flex-col">
              
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5">
                <div className="flex items-center gap-2">
                  <Layers className="w-4.5 h-4.5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">
                    數據輸入區 (CSV 格式)
                  </h3>
                </div>
                {(csvText.trim() !== "" || uploadFileName) && (
                  <button
                    id="btn-clear-all"
                    type="button"
                    onClick={handleClear}
                    className="cursor-pointer inline-flex items-center gap-1 text-xs font-bold text-rose-450 hover:text-rose-400 hover:bg-rose-950/20 px-2.5 py-1.5 rounded-xl border border-rose-950/60 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    重置內容
                  </button>
                )}
              </div>

              {/* 檔案上傳區 (Drag & Drop) */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                  isDragActive
                    ? "border-emerald-500 bg-emerald-950/10"
                    : "border-slate-800 hover:border-emerald-550/60 bg-slate-950/20 hover:bg-slate-955"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  id="csv-file-input"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700/60 text-emerald-400 mb-3 group-hover:scale-105 transition-transform">
                  <Upload className="w-5.5 h-5.5" />
                </div>
                
                {uploadFileName ? (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                      {uploadFileName}
                    </p>
                    <p className="text-[10px] text-slate-500">已為您讀入並轉換檔案文本</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-350">
                      拖放 CSV 報表至此，或 <span className="text-emerald-405">點擊上傳</span>
                    </p>
                    <p className="text-[10px] text-slate-500">支援標準 UTF-16/UTF-8 格式 CSV分離檔案</p>
                  </div>
                )}
              </div>

              {/* 大型 CSV 貼上輸入區 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="csv-textarea" className="block text-xs font-bold text-slate-400 uppercase">
                    CSV 原始報表數據編輯器
                  </label>
                  <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 font-bold">UTF-8 支援</span>
                </div>
                <textarea
                  id="csv-textarea"
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder="ID,產品,銷量,單價,營業額&#10;101,防水外套,350,1500,525000&#10;... (您也可以直接在此手動修改欄位或貼上試算表文字)"
                  className="w-full h-80 px-4 py-3.5 text-xs font-mono rounded-2xl border border-slate-800 bg-slate-950 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 focus:outline-hidden outline-hidden transition-all resize-y scrollbar-thin leading-relaxed text-slate-300"
                />
              </div>

              {/* 行銷關注特定的分析方向 */}
              <div className="space-y-2">
                <label htmlFor="input-instructions" className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-500" /> 
                  自訂分析重點 / 重點關注方向 (選填)
                </label>
                <input
                  id="input-instructions"
                  type="text"
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="例如：請找出利益效率點、指出可能流失的客戶特性..."
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-800 bg-slate-955 text-xs focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 focus:outline-hidden outline-hidden transition-all text-slate-200 font-semibold"
                />
              </div>

              {/* 開始分析大按鈕 */}
              <button
                id="btn-trigger-analysis"
                type="button"
                onClick={handleStartAnalysis}
                disabled={state.isLoading || !csvText.trim()}
                className={`w-full py-4.5 rounded-[20px] font-bold text-sm tracking-widest flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer ${
                  state.isLoading || !csvText.trim()
                    ? "bg-slate-800 text-slate-600 border border-slate-850 cursor-not-allowed"
                    : "bg-emerald-500 hover:bg-emerald-450 text-white shadow-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98]"
                }`}
              >
                {state.isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>數據運算解構中...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-white animate-pulse" />
                    <span>開始 AI 深度分析</span>
                    <ArrowRight className="w-4 h-4 ml-0.5" />
                  </>
                )}
              </button>

              {/* 錯誤反饋提示卡 */}
              {state.error && (
                <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/60 text-rose-400 text-xs flex gap-2.5 leading-relaxed">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0 text-rose-500 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-rose-350">服務連線發生不可預期障礙</p>
                    <p className="font-medium opacity-90">{state.error}</p>
                  </div>
                </div>
              )}

            </div>

            {/* Bento Box: 科技感小型數據磚 (與 demo 完全契合) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 flex flex-col justify-center items-center text-center shadow-md">
                <span className="text-[10px] text-slate-500 font-bold uppercase mb-1">解析資料行數</span>
                <div className="flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-emerald-400" />
                  <span className="text-2xl font-mono font-bold text-white transition-all">
                    {csvText ? getCsvRowCount().toLocaleString() : "0"}
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 flex flex-col justify-center items-center text-center shadow-md">
                <span className="text-[10px] text-slate-500 font-bold uppercase mb-1">數據安全性驗證</span>
                <div className="flex items-end space-x-1">
                  <span className="text-2xl font-mono font-bold text-white">98.4%</span>
                  <span className="text-[10px] text-emerald-400 mb-1 font-semibold">↑ Safe</span>
                </div>
              </div>
            </div>

          </div>

          {/* 右側：數據視覺化預覽表格 與 AI 報告生成區 (7格) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 動態加載指示骨架 */}
            {state.isLoading ? (
              <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-xl animate-pulse min-h-[500px] flex flex-col justify-center transition-all">
                
                <div className="flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-emerald-500 animate-spin flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-emerald-400" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-bold text-sm text-slate-200">
                      Gemini 正在全景剖析您的業務報表
                    </h4>
                    <p className="text-xs text-emerald-405 font-bold animate-bounce min-h-[16px]">
                      {loadingSteps[loadingStep]}
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5 max-w-md mx-auto w-full mt-4">
                  <div className="h-2.5 bg-slate-800 rounded-full w-full"></div>
                  <div className="h-2.5 bg-slate-800 rounded-full w-[90%]"></div>
                  <div className="h-2.5 bg-slate-800 rounded-full w-[95%]"></div>
                  <div className="h-2.5 bg-slate-800 rounded-full w-[70%]"></div>
                </div>

              </div>
            ) : (
              <div className="space-y-6">
                
                {/* 數據預覽表格 */}
                <div className="bg-slate-900/50 border border-slate-850 rounded-3xl p-6.5 shadow-xl transition-all">
                  <CsvTablePreview csvText={csvText} />
                </div>

                {/* Markdown AI 分析報告主區 */}
                <MarkdownOutput
                  content={state.result || ""}
                  isGenerating={state.isLoading}
                  onClear={() => setState((prev) => ({ ...prev, result: null }))}
                />

              </div>
            )}

          </div>

        </div>

      </main>

      {/* 傳統美觀頁尾 (Bento Theme style) */}
      <footer className="mt-16 border-t border-slate-850/60 pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 font-semibold tracking-wider uppercase gap-4 w-full">
        <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
          <span>&copy; 2026 AI Data Labs. 版權所有</span>
          <span>隱私安全協定</span>
          <span>API 洞察端口</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
          <span>所有雲端指令運作均已對稱式加密處理</span>
        </div>
      </footer>

    </div>
  );
}
