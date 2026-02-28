// Vercel Serverless Function - API Proxy for Google Gemini
import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // Handle preflight
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { apiKey, messages, system } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: "API Key is required" });
    }

    // Initialize the Official SDK with the provided key
    const ai = new GoogleGenAI({ apiKey: apiKey });

    // Format messages for Gemini sdk
    const formattedMsgs = messages.filter((m, i, arr) => i !== arr.length -1).map(m => ({
        role: m.role === 'assistant' ? 'model' : m.role,
        parts: [{ text: m.content || m.parts[0].text }]
    }));
    
    // Create the chat session
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: req.body.messages,
        config: {
            systemInstruction: system,
            maxOutputTokens: 800,
        }
    });

    // Return the response mimicking the previous structure so app.js doesn't break if it was slightly different
    return res.status(200).json({
        content: [{ text: response.text }] 
    });
  } catch (error) {
    console.error("Proxy error:", error);

    // Provide error response
    return res.status(error.status || 500).json({
      error: error.message || "Internal server error",
    });
  }
}
