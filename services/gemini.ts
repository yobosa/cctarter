
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async findMembershipsNear(location: string, category: string) {
    const prompt = `Find top-rated ${category} memberships near ${location}. Focus on luxury or annual plans.`;
    
    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
      },
    });

    return {
      text: response.text,
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  }

  async identifyCollectionItems(base64Image: string, category: 'LIBRARY' | 'SCENTS') {
    const prompt = category === 'LIBRARY' 
      ? "Identify the books in this image. For each, give the title and author. Format as JSON array of objects with 'name' and 'brandOrAuthor'."
      : "Identify the perfume or scent bottles in this image. For each, give the brand and scent name. Format as JSON array of objects with 'name' and 'brandOrAuthor'.";

    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              brandOrAuthor: { type: Type.STRING }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || '[]');
  }

  async animateCollection(base64Image: string, prompt: string) {
    // Note: Veo requires a separate API Key selection in many contexts, but we follow the process.env.API_KEY convention here.
    let operation = await this.ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      image: {
        imageBytes: base64Image,
        mimeType: 'image/jpeg',
      },
      config: {
        numberOfVideos: 1,
        resolution: '1080p',
        aspectRatio: '16:9'
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await this.ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    return `${downloadLink}&key=${process.env.API_KEY}`;
  }
}

export const gemini = new GeminiService();
