
import { GoogleGenAI } from "@google/genai";

// Fix: Initialize GoogleGenAI with the API key directly from environment variables.
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const askPhysicsAI = async (query: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: query,
    config: {
      systemInstruction: `You are an expert Physics and Fluid Dynamics professor. 
      Help the user solve complex fluid dynamics or scientific problems. 
      Provide step-by-step calculations. Use LaTeX for math symbols. 
      If the user provides parameters (like Reynolds number, velocity, density), 
      explain what the result means physically (e.g., laminar vs turbulent flow).`,
      temperature: 0.7,
      thinkingConfig: { thinkingBudget: 4000 }
    },
  });

  return response.text;
};

export const solveFluidProblem = async (params: any) => {
    const ai = getAI();
    const prompt = `Solve this fluid dynamics problem with parameters: ${JSON.stringify(params)}. Provide a concise explanation and result.`;
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
    });
    return response.text;
}
