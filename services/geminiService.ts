
import { GoogleGenAI, Type } from "@google/genai";
import { Language, VoiceDetectionResponse } from "../types";

export class GeminiService {
  private getAi() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }
    return new GoogleGenAI({ apiKey });
  }

  async detectVoice(audioBase64: string, language: Language): Promise<VoiceDetectionResponse> {
    try {
      const ai = this.getAi();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            { inlineData: { mimeType: "audio/mp3", data: audioBase64 } },
            { text: `Analyze the ${language} audio. Classify as 'AI_GENERATED' or 'HUMAN'. Return JSON.` }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              classification: { type: Type.STRING, enum: ["AI_GENERATED", "HUMAN"] },
              confidenceScore: { type: Type.NUMBER },
              explanation: { type: Type.STRING }
            },
            required: ["classification", "confidenceScore", "explanation"]
          }
        }
      });

      // Directly access .text property from the response object.
      const parsed = JSON.parse(response.text || '{}');
      return {
        status: 'success',
        language,
        classification: (parsed.classification as 'AI_GENERATED' | 'HUMAN') || 'HUMAN',
        confidenceScore: parsed.confidenceScore || 0.5,
        explanation: parsed.explanation || "Analysis complete."
      };
    } catch (error: any) {
      console.error("Gemini DetectVoice Error:", error);
      return { status: 'error', language, classification: 'HUMAN', confidenceScore: 0, explanation: "Engine Error: " + (error.message || "Unknown Error") };
    }
  }

  async honeypotEngagement(text: string, history: any[], language: string) {
    const ai = this.getAi();
    const prompt = `Persona: Naive user. Goal: Extract scam info. Current: "${text}". History: ${JSON.stringify(history)}. Output JSON.`;
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            isFinished: { type: Type.BOOLEAN },
            extracted: {
              type: Type.OBJECT,
              properties: {
                bankAccounts: { type: Type.ARRAY, items: { type: Type.STRING } },
                upiIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                phishingLinks: { type: Type.ARRAY, items: { type: Type.STRING } },
                phoneNumbers: { type: Type.ARRAY, items: { type: Type.STRING } },
                suspiciousKeywords: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          },
          required: ["reply", "isFinished", "extracted"]
        }
      }
    });
    // Directly access .text property from the response object.
    return JSON.parse(response.text || '{}');
  }

  async triggerGuviCallback(sessionId: string, result: any, totalMessages: number) {
    try {
      await fetch("https://hackathon.guvi.in/api/updateHoneyPotFinalResult", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": "sk_submission_live_shield_ai" },
        body: JSON.stringify({
          sessionId,
          scamDetected: true,
          totalMessagesExchanged: totalMessages,
          extractedIntelligence: result.extracted,
          agentNotes: "Scam details extracted autonomously."
        })
      });
    } catch (e) { console.error("Callback failed", e); }
  }
}

export const geminiService = new GeminiService();
