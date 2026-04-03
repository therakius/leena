import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";
import { configDotenv } from "dotenv";

configDotenv()

// --- Clients ---
const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// --- Primary: Gemini ---
async function askGemini(instruction, prompt) {
  const response = await gemini.models.generateContent({
    model: "gemini-3-flash-preview",
    systemInstruction: instruction,
    contents: prompt, 
  });
  return response.text;
}

// --- Fallback: Groq ---
async function askGroq(instruction, prompt) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: instruction,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });
  return completion.choices[0]?.message?.content ?? "";
}

// --- Main: try Gemini, fall back to Groq ---
export async function ask(instruction, prompt) {
  try {
    console.log("Trying Gemini...");
    const result = await askGemini(instruction, prompt);
    console.log("Gemini responded.");
    return result;
  } catch (err) {
    console.warn(`Gemini failed: ${err.message}. Falling back to Groq...`);
    const result = await askGroq(instruction, prompt);
    console.log("Groq responded.");
    return result;
  }
}
