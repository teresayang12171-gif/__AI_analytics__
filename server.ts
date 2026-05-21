import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json({ limit: "50mb" })); // 防止大型 CSV 造成請求過大錯誤
const PORT = 3000;

// 取得 Gemini 用戶端
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY 尚未設定。請於 AI 平台的 [Settings] -> [Secrets] 面板中新增 GEMINI_API_KEY 變數以啟用 AI 洞察功能。");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// 設定 AI 的 System Instruction 常數，定義其專業身份、行為和輸出格式
const SYSTEM_INSTRUCTION = `你是一位資深的「AI 商業數據分析師與決策顧問」。你的任務是精準、客觀且深刻地解讀使用者提供的 CSV 或結構化表格數據，並將其轉化為有利於商業決策的精采分析。

請嚴格遵循以下規格進行回覆：
1. **語系限制**：不論 CSV 中的欄位或數據是英文、日文還是中文，你的分析報告、指針與回覆內容均必須「完全使用繁體中文（台灣習慣用語，例如：數據、資訊、行銷、利潤、營收、專案）」。
2. **輸出格式**：使用 Markdown 語法，排版需結構井然、多用列表與粗體，可適度搭配 Emoji 增強視覺引導，但必須保持商務、專業的品牌感。
3. **分析結構（請完整包含以下項目）**：
   - 📊 **數據全景摘要**：簡明扼要說明此份數據的基本特徵。包括：這份資料是什麼？它的觀察對象有哪些？涉及多少筆記錄及哪些核心維度？
   - 📈 **關鍵指標與運算 KPI**：統整出最核心的數據總和、平均、極值（最大 / 最小）或值得注意的統計分布，並列出核心數據清單。
   - 💡 **核心商业洞察**：
     - 分析數據變化的趨勢與隱藏模式。
     - 點出顯著的異常數據、高峰、低谷、潛在因果關係或週期變化。
     - 說明何處績效最優異，並指出何處是急需解決的痛點瓶頸。
   - 🎯 **行動導向的策略建議**：根據洞察結果，具體給出 3 ~ 5 點具備「可落地、可執行性 (Actionable)」的商業或營運優化政策，告訴使用者下一步該如何採取行動以提升績效、降低成本或防範風險。
4. **誠實原則**：請僅基於使用者傳遞的真實數據進行深度分析，不得虛構無依據之數據。若有重要欄位缺失或不全，可在報告中提出。`;

// 定義分析 API
app.post("/api/analyze", async (req, res) => {
  try {
    const { csvData, customInstructions } = req.body;

    if (!csvData || typeof csvData !== "string" || csvData.trim() === "") {
      return res.status(400).json({ error: "請傳送有效的 CSV 報表內容資料。" });
    }

    const ai = getGeminiClient();

    // 組裝 Prompt
    let userPrompt = `以下為需要你解析的 CSV 資料報表內容：\n\n\`\`\`csv\n${csvData}\n\`\`\``;

    if (customInstructions && typeof customInstructions === "string" && customInstructions.trim() !== "") {
      userPrompt += `\n\n使用者額外指定的「分析重點與關注方向」：\n- ${customInstructions}`;
    }

    console.log("[Gemini API] 開始發送 CSV 數據進行分析...");
    
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3, // 設定較低溫度以提高數據解讀的準確性與一致性
      },
    });

    const resultText = response.text;
    res.json({ result: resultText });
  } catch (error: any) {
    console.error("[Backend Error] API 發生異常:", error);
    res.status(500).json({ error: error.message || "伺服器內部發生錯誤，請稍候重試。" });
  }
});

// Vite 與靜態檔案中介軟體設定
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] 後端服務已啟動，監聽埠: http://localhost:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error("[ServerError] 無法啟動 Express 伺服器:", err);
  process.exit(1);
});
