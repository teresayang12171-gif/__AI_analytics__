import type { Config, Context } from "@netlify/functions";
import { GoogleGenAI } from "@google/genai";

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

export default async (req: Request, context: Context) => {
  // CORS Headers in case of preflight or cross-origin requests
  const headers = new Headers({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  });

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers,
    });
  }

  try {
    const { csvData, customInstructions } = await req.json();

    if (!csvData || typeof csvData !== "string" || csvData.trim() === "") {
      return new Response(JSON.stringify({ error: "請傳送有效的 CSV 報表內容資料。" }), {
        status: 400,
        headers,
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[Netlify Function] GEMINI_API_KEY is missing");
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY 尚未設定。請於 Netlify 後台或環境變數中設定 GEMINI_API_KEY。" }),
        {
          status: 500,
          headers,
        }
      );
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
    });

    // 組裝 Prompt
    let userPrompt = `以下為需要你解析的 CSV 資料報表內容：\n\n\`\`\`csv\n${csvData}\n\`\`\``;

    if (customInstructions && typeof customInstructions === "string" && customInstructions.trim() !== "") {
      userPrompt += `\n\n使用者額外指定的「分析重點與關注方向」：\n- ${customInstructions}`;
    }

    console.log("[Netlify Function] 開始發送 CSV 數據進行分析...");
    
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3,
      },
    });

    const resultText = response.text;
    return new Response(JSON.stringify({ result: resultText }), {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error("[Netlify Function Error] 發生異常:", error);
    return new Response(JSON.stringify({ error: error.message || "伺服器內部發生錯誤，請稍候重試。" }), {
      status: 500,
      headers,
    });
  }
};

export const config: Config = {
  path: "/api/analyze",
};
