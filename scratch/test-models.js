const { GoogleGenAI } = require("@google/genai");
const dotenv = require("dotenv");
const path = require('path');

// Load environment variables from project root .env
dotenv.config({ path: 'c:\\Users\\LENOVO\\Desktop\\Mitra\\mitra-ai-architect\\.env' });

async function test() {
  let apiKey = process.env.GEMINI_API_KEY;
  console.log("API Key loaded:", apiKey ? apiKey.substring(0, 10) + "..." : "undefined");
  
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    apiKey = "AIzaSyDpZ-HpH40EuD6d538MNQYwrw8mpc_tw7s";
  }
  
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    console.log("Calling Gemini API with gemini-2.5-flash...");
    const start = Date.now();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Hello, tell me a 1-sentence joke.",
    });
    console.log("Response (gemini-2.5-flash):", response.text);
    console.log("Time taken (gemini-2.5-flash):", (Date.now() - start) + "ms");
  } catch (error) {
    console.error("Error with gemini-2.5-flash:", error.message || error);
  }

  try {
    console.log("Calling Gemini API with gemini-2.0-flash...");
    const start = Date.now();
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: "Hello, tell me a 1-sentence joke.",
    });
    console.log("Response (gemini-2.0-flash):", response.text);
    console.log("Time taken (gemini-2.0-flash):", (Date.now() - start) + "ms");
  } catch (error) {
    console.error("Error with gemini-2.0-flash:", error.message || error);
  }

  try {
    console.log("Calling Gemini API with gemini-1.5-flash...");
    const start = Date.now();
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: "Hello, tell me a 1-sentence joke.",
    });
    console.log("Response (gemini-1.5-flash):", response.text);
    console.log("Time taken (gemini-1.5-flash):", (Date.now() - start) + "ms");
  } catch (error) {
    console.error("Error with gemini-1.5-flash:", error.message || error);
  }
}

test();
