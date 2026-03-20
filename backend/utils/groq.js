const Groq = require("groq-sdk");

let groq;

const generateExplanation = async (code, language) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured in .env. Go to console.groq.com to get one!');
  }
  
  if (!groq) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  
  const prompt = `You are a senior developer. Briefly, simply, and clearly explain what the following ${language || 'code'} snippet does in exactly 1 or 2 clear paragraphs. Focus strictly on explaining the logic to a junior dev. Do not echo the code.
  
Code:
${code}`;

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: "You are a concise, extremely insightful code explainer." },
      { role: "user", content: prompt }
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.5,
    max_tokens: 400,
  });

  return chatCompletion.choices[0]?.message?.content || "No explanation generated.";
};

module.exports = { generateExplanation };
