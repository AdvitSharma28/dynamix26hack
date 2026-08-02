const Groq = require('groq-sdk');

let groq;
if (process.env.GROQ_API_KEY) {
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
} else {
  console.warn('GROQ_API_KEY is not set. Groq API will fail.');
}

module.exports = groq;
