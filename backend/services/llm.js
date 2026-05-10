import { GoogleGenerativeAI } from "@google/generative-ai";
// require("dotenv").config();
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
console.log("API Key loaded:", apiKey ? `${apiKey.substring(0, 10)}...` : "NOT FOUND");

const client = new GoogleGenerativeAI(apiKey);

export async function generateAnswer(query, docs) {

  const context = docs
    .map((doc) => doc.pageContent)
    .join("\n\n");

  const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `You are a RAG AI assistant.

Answer ONLY from the provided context.

If the answer is not in the context,
say:
"I could not find this in the document."

Context:
${context}

User question: ${query}`;

  const response = await model.generateContent(prompt);

  return response.response.text();
}