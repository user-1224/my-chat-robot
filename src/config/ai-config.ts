export const aiConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL,
  apiKey: import.meta.env.VITE_API_KEY,
  model: import.meta.env.VITE_API_MODEL,
  maxTokens: import.meta.env.VITE_API_MAX_TOKENS,
  temperature: import.meta.env.VITE_API_TEMPERATURE,
  systemPrompt: import.meta.env.VITE_API_SYSTEM_PROMPT
}