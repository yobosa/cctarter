import { GoogleGenAI, Type } from '@google/genai';

export class GeminiService {
  private client: GoogleGenAI | null = null;
  get isConfigured() { const key = process.env.API_KEY; return !!key && key !== 'PLACEHOLDER_API_KEY' && key.trim().length > 10; }
  private get ai() {
    if (!this.isConfigured) throw new Error('AI is not configured.');
    return this.client ??= new GoogleGenAI({ apiKey: process.env.API_KEY, httpOptions: { timeout: 30000 } });
  }
  async findMembershipsNear(location: string, category: string) {
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Find ${category} memberships near ${location}. Include location and source links. Do not invent prices or discounts.`,
      config: { tools: [{ googleMaps: {} }] },
    });
    const sources = (response.candidates?.[0]?.groundingMetadata?.groundingChunks || []).flatMap(chunk => {
      const source = chunk.maps || chunk.web;
      return source?.uri && /^https?:\/\//i.test(source.uri) ? [{ title: source.title || 'Source', uri: source.uri }] : [];
    });
    if (!response.text) throw new Error('No recommendations returned.');
    return { text: response.text, sources };
  }
  async identifyCollectionItems(base64Image: string, category: 'LIBRARY' | 'SCENTS'): Promise<{ name: string; brandOrAuthor: string }[]> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ inlineData: { mimeType: 'image/jpeg', data: base64Image } }, { text: `Identify ${category === 'LIBRARY' ? 'books with their authors' : 'fragrances with their brands'} in this image. Return name and brandOrAuthor for each. Only include items you can identify.` }] },
      config: { responseMimeType: 'application/json', responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, brandOrAuthor: { type: Type.STRING } }, required: ['name', 'brandOrAuthor'] } } },
    });
    const parsed: unknown = JSON.parse(response.text || '[]');
    if (!Array.isArray(parsed)) throw new Error('Invalid scan result.');
    return parsed.filter(item => item && typeof item.name === 'string' && item.name.trim() && typeof item.brandOrAuthor === 'string').map(item => ({ name: item.name.trim().slice(0, 160), brandOrAuthor: item.brandOrAuthor.trim().slice(0, 160) }));
  }
}
export const gemini = new GeminiService();
