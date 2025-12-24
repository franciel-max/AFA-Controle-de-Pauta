
import { GoogleGenAI } from "@google/genai";

export const analyzeHearings = async (hearings: string[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  if (!process.env.API_KEY) return "Erro: API Key não configurada.";

  const prompt = `
    Você é um assistente jurídico especializado em organização de pautas.
    Abaixo estão as descrições das audiências marcadas para um dia específico:
    ${hearings.map((h, i) => h ? `Audiência ${i + 1}: ${h}` : "").filter(Boolean).join("\n")}

    Por favor, forneça um breve resumo executivo deste dia de trabalho, destacando possíveis conflitos ou pontos de atenção. 
    Use os termos "TIPO DE AUDIÊNCIA" e "OBSERVAÇÕES" para se referir aos dados fornecidos.
    Responda em Português de forma profissional e concisa.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "Não foi possível gerar um resumo.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erro ao processar resumo com IA.";
  }
};
