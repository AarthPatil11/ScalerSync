const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const chatItems = require("./local-ingestion");
const announcements = require("./scraper");

const SYSTEM_PROMPT = `You classify campus information items.

Categorize EVERY item as exactly one of:
- "CRITICAL": deadlines, forms, payments, exams, or anything that requires timely action
- "EVENT": upcoming activities, contests, workshops, lectures, meetups
- "NEWS": general information that is neither a hard deadline/form nor an upcoming activity

Rules:
- Output ONLY a valid JSON array. No markdown fences, no commentary, no trailing text.
- Every object MUST use this exact shape:
  { "category": "CRITICAL"|"EVENT"|"NEWS", "source": string, "title": string, "description": string, "timestamp": string }
- Preserve the given source field.
- title: a short heading (for chat messages, summarize the body; for announcements, keep the title).
- description: the item body/content.
- timestamp: the item's date/time as a single string. Use "" if unknown.
- Include every input item. Do not invent extra items.`;

function combineItems(chat, web) {
  return [
    ...chat.map((m) => ({
      source: "whatsapp",
      title: m.sender || "WhatsApp message",
      date: [m.date, m.time].filter(Boolean).join(" "),
      content: m.body || "",
    })),
    ...web.map((a) => ({
      source: "announcements",
      title: a.title || "",
      date: a.date || "",
      content: a.content || "",
    })),
  ];
}

function parseJsonArray(text) {
  const cleaned = text.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start === -1 || end === -1) {
    throw new Error("Gemini did not return a JSON array");
  }
  const parsed = JSON.parse(cleaned.slice(start, end + 1));
  if (!Array.isArray(parsed)) {
    throw new Error("Gemini JSON was not an array");
  }
  return parsed;
}

async function sendToGemini(items) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("Set GEMINI_API_KEY (or GOOGLE_API_KEY) in the environment");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0,
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent(
    `Classify this array of items:\n${JSON.stringify(items, null, 2)}`
  );
  return parseJsonArray(result.response.text());
}

async function main() {
  const combined = combineItems(chatItems, announcements);
  const classified = await sendToGemini(combined);
  const payload = JSON.stringify(classified, null, 2) + "\n";
  const outPaths = [
    path.join(__dirname, "final_data.json"),
    path.join(__dirname, "FinalPortal", "final_data.json"),
  ];
  for (const outPath of outPaths) {
    fs.writeFileSync(outPath, payload, "utf8");
    console.log(`Wrote ${classified.length} items to ${outPath}`);
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err.message || err);
    process.exit(1);
  });
}

module.exports = { combineItems, sendToGemini, SYSTEM_PROMPT };
