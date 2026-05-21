import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json({ limit: "50mb" })); // 防止大型 CSV 造成請求過大錯誤
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// 取得 Gemini 用戶端
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY 尚未設定。請於專案根目錄的 .env 檔案中設定 GEMINI_API_KEY 以啟用 AI 洞察功能。");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
  });
};

// 設定 AI 的 System Instruction 常數，定義其專業身份、行為和輸出格式
const SYSTEM_INSTRUCTION = `你是一位專業的資料分析師。
你的任務是接收一段 CSV 或表格結構的原始數據，理解其欄位意義，並提出精確的摘要報告與洞察。

請務必嚴格遵循以下 Markdown 輸出格式：

### 1. 📊 資料概況與欄位理解
簡要說明這份資料的主題是什麼，並列出關鍵欄位的意義。

### 2. ⚠️ 異常與缺值檢查
檢查資料中是否有空白（例如缺少數量或金額）、極端值（例如不合理的高價），並將發現的異常項目條列出來。若無異常，說明「未發現明顯異常」。

### 3. 📈 統計與趨勢洞察
請回答以下問題的總結：
- **總計概況**：銷售數量或總金額的大概加總。
- **分類表現**：哪個業務員或哪項產品表現最好？
- **業務建議**：從數據中給出 1-2 個可以執行的商業建議。

請以 Markdown 格式輸出，所有繁體中文部分必須使用**繁體中文**回覆，不要包含任何額外的問候語或結語。`;

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
  const isProduction = process.env.NODE_ENV === "production" || __dirname.endsWith("dist") || __dirname.endsWith("dist/");

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // 依據執行路徑決定靜態檔案目錄 (若已被打包至 dist/ 則 __dirname 即為 dist)
    const distPath = __dirname.endsWith("dist") || __dirname.endsWith("dist/")
      ? __dirname
      : path.join(__dirname, "dist");

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
