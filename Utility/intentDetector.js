const GREETING_PATTERNS = [
  /^(hi|hello|hey|heyy|heya|howdy|hola|namaste|greetings)\b/i,
  /^good\s*(morning|afternoon|evening|day)\b/i,
  /^(who are you|what can you do|help me|how does this work|what is this|what are you)\b/i,
  /^(thanks|thank you|thx|bye|goodbye|see you|cya)\b/i,
];

const isCasualOrGreeting = (text) => {
  if (!text) return true;
  const trimmed = text.trim().toLowerCase();
  if (trimmed.length <= 4 && /^(hi|hey|yo|hello|hola)$/i.test(trimmed)) {
    return true;
  }
  return GREETING_PATTERNS.some((pattern) => pattern.test(trimmed));
};

module.exports = { isCasualOrGreeting };
