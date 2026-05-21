# AI 數據分析與洞察工具

這是一款專為數據分析與商業洞察設計的 AI 工具。支援 CSV 上傳與解析、表格視覺化預覽，並採用 Google Gemini 進行深度、智慧的數據解讀與商業洞察產出。

## 本地開發與啟動指南

### 系統需求
- **Node.js**: 建議 v18 或以上版本

### 步驟說明

1. **安裝相依套件**：
   ```bash
   npm install
   ```

2. **設定環境變數**：
   - 複製 `.env.example` 並命名為 `.env`：
     ```bash
     cp .env.example .env
     ```
   - 開啟 `.env` 檔案，在 `GEMINI_API_KEY` 填入您的 Gemini API 金鑰。

3. **啟動開發伺服器**：
   ```bash
   npm run dev
   ```
   - 伺服器啟動後，請在瀏覽器中開啟 `http://localhost:3000` 來使用本工具。

## 專案指令
- `npm run dev`: 啟動開發伺服器（搭配熱重載 HMR）。
- `npm run build`: 打包前端資產與後端 Express 程式。
- `npm run start`: 執行打包後的生產環境程式。
- `npm run lint`: 使用 TypeScript 進行專案型別檢查。
