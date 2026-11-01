const fs = require("fs");
const path = require("path");

const FILE = process.argv[2] || path.join(__dirname, "_chat.txt");
const LIMIT = 20;

// iOS:  [31/10/26, 10:30:15] Name: text
// Android: 31/10/26, 10:30 - Name: text
const LINE_RE =
  /^\[?(\d{1,2}\/\d{1,2}\/\d{2,4}),\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[APap][Mm])?)\]?(?:\s+-\s+|\s+)([^:]+):\s(.*)$/;

function clean(text) {
  return text.replace(/^[\u200e\u200f\u202a-\u202e\ufeff]+/, "").trim();
}

function parseChat(raw) {
  const messages = [];

  for (const line of raw.split(/\r?\n/)) {
    const text = clean(line);
    if (!text) continue;

    const match = text.match(LINE_RE);
    if (match) {
      messages.push({
        date: match[1],
        time: match[2],
        sender: match[3].trim(),
        body: match[4],
      });
    } else if (messages.length) {
      messages[messages.length - 1].body += "\n" + text;
    }
  }

  return messages.slice(-LIMIT);
}

function getMessages() {
  try {
    return parseChat(fs.readFileSync(FILE, "utf8"));
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}

const messages = getMessages();

if (require.main === module) {
  process.stdout.write(JSON.stringify(messages, null, 2) + "\n");
}

module.exports = messages;
