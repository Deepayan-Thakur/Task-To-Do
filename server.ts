import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API Routes
app.post("/api/ai/breakdown", async (req, res) => {
  try {
    const { taskTitle, taskDescription } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
    }

    const ai = new GoogleGenAI({ 
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });

    const prompt = `Break down the following task into a structured list of actionable subtasks and suggest a difficulty level (1-5) and estimated duration in minutes.
    Task: ${taskTitle}
    Description: ${taskDescription || 'No description provided'}
    
    Respond in valid JSON format.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["subtasks", "suggestedDifficulty", "estimatedTotalMinutes"],
          properties: {
            subtasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["title", "description"],
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING }
                }
              }
            },
            suggestedDifficulty: { type: Type.INTEGER },
            estimatedTotalMinutes: { type: Type.INTEGER }
          }
        }
      }
    });

    res.json(JSON.parse(response.text));
  } catch (error) {
    console.error("AI Breakdown Error:", error);
    res.status(500).json({ error: "Failed to break down task" });
  }
});

// Vite Middleware
async function initializeServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

initializeServer();
