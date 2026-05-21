import { FileSpreadsheet, TrendingUp, Users, Target } from "lucide-react";
import { AnalysisSample } from "../types";

const SAMPLES: AnalysisSample[] = [
  {
    id: "ecommerce",
    title: "電商季度銷售分析",
    icon: "FileSpreadsheet",
    description: "提供商品分類、銷量、定價、行銷管道與退貨率數據，適合分析利潤點及退貨影響。",
    defaultFocus: "分析哪類產品最賺錢？退貨率高的產品在哪些行銷渠道購買居多？請給出優化行銷預算配比的具體方案。",
    csvData: `商品ID,商品名稱,類別,銷售數量,商品單價,總營收,退貨率,主力廣告行銷渠道
E101,輕量防水防風外套,戶外服飾,450,2280,1026000,0.03,Google關鍵字
E102,透氣機能慢跑鞋,運動鞋類,680,1850,1258000,0.08,Facebook社群廣告
E103,藍牙運動抗噪耳機,3C配件,320,3200,1024000,0.12,KOL網紅推薦
E104,不鏽鋼戶外保溫杯,生活用品,950,580,551000,0.01,Google關鍵字
E105,超輕量超寬越野帳篷,戶外服飾,120,8900,1068000,0.15,KOL網紅推薦
E106,專業登山多功能背包,戶外服飾,280,3500,980000,0.04,Facebook社群廣告
E107,高強度抗震健走杖,生活用品,510,990,504900,0.02,Google關鍵字
E108,極速吸濕排汗衣,運動鞋類,1100,750,825000,0.05,Facebook社群廣告`,
  },
  {
    id: "saas",
    title: "SaaS 用戶訂閱與流失漏斗",
    icon: "Users",
    description: "軟體服務訂閱數據，包含註冊用戶、付費用戶、每月留存度、ARR、LTV及獲客成本。",
    defaultFocus: "結合 ARR 成長動能以及 CAC、LTV 等效率指標，評估目前的用戶增長策略與健康度，並針對客戶流失提出具體挽留方案。",
    csvData: `月份,新註冊用戶數,付費轉化用戶數,每月續訂率,月度經常性營收MRR,月度客戶獲客成本CAC,客戶生命週期價值LTV
1月,1250,120,0.95,150000,1800,24000
2月,1480,155,0.94,185000,1650,23000
3月,1720,190,0.92,230000,1900,22500
4月,2100,210,0.93,275000,2100,22000
5月,2350,245,0.91,320000,1750,21500
6月,2800,312,0.89,410000,2050,19500
7月,2950,290,0.88,435000,2200,19000
8月,3200,350,0.87,495000,2350,18500`,
  },
  {
    id: "marketing",
    title: "數位行銷活動成效報表",
    icon: "Target",
    description: "追蹤各種行銷管道的廣告預算、點擊率(CTR)與轉化率，用以計算 ROAS 及點擊成本。",
    defaultFocus: "找出 ROAS (廣告投資報酬率) 表現最佳與最差的廣告活動，並對未來一季的各管道廣告預算分配提供具體的重新配置建議。",
    csvData: `活動名稱,行銷平台,廣告預算支出,總曝光次數,點擊率CTR,轉化成交數,成效總營收,ROAS
2026開學季大促,Facebook,250000,3500000,0.018,480,720000,2.88
限時免運快充優惠,Google關鍵字,120000,850000,0.045,310,480000,4.0
新春穿搭達人秀,Instagram KOL,350000,4200000,0.012,240,425000,1.21
極簡居家設計週,Pinterest,80000,1200000,0.021,110,210000,2.63
會員感謝祭專案,EDM電子報,20000,150000,0.085,180,160000,8.0
週五驚喜免運,Line官方帳號,60000,500000,0.052,210,220000,3.67`,
  },
];

interface SampleLoaderProps {
  onSelectSample: (csv: string, focus: string) => void;
}

export default function SampleLoader({ onSelectSample }: SampleLoaderProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "FileSpreadsheet":
        return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
      case "Users":
        return <Users className="w-5 h-5 text-emerald-400" />;
      case "Target":
        return <Target className="w-5 h-5 text-emerald-400" />;
      default:
        return <TrendingUp className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-slate-200">
        <TrendingUp className="w-5 h-5 text-emerald-400" />
        <h3 className="text-sm font-bold tracking-tight uppercase">快速載入 CSV 數據分析樣板範例</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SAMPLES.map((sample) => (
          <button
            key={sample.id}
            id={`btn-sample-${sample.id}`}
            type="button"
            onClick={() => onSelectSample(sample.csvData, sample.defaultFocus || "")}
            className="group relative flex flex-col text-left p-5 rounded-3xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/90 hover:border-emerald-500/55 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-emerald-950/20 cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-2.5">
              <div className="p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700/50 group-hover:bg-slate-850 dark:group-hover:bg-slate-800/90 transition-colors">
                {getIcon(sample.icon)}
              </div>
              <span className="font-bold text-sm text-slate-100 group-hover:text-emerald-400 transition-colors">
                {sample.title}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
              {sample.description}
            </p>
            <div className="mt-4 text-[11px] font-bold text-emerald-400 group-hover:translate-x-1.5 transition-transform flex items-center gap-1">
              一鍵載入數據範例 &rarr;
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

