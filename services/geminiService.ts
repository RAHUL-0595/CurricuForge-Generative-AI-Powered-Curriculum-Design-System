
import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
import { Curriculum, GenerationParams } from "../types";

// Always use named parameter for apiKey and use process.env.API_KEY directly.
const createAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const CURRICULUM_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Professional title of the course" },
    description: { type: Type.STRING, description: "Detailed overview of the course" },
    targetAudience: { type: Type.STRING, description: "Who this course is designed for" },
    totalDuration: { type: Type.STRING, description: "Estimated total hours/weeks to complete" },
    modules: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          topics: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                duration: { type: Type.STRING },
                description: { type: Type.STRING },
                keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["id", "title", "duration", "description", "keyPoints"]
            }
          },
          learningOutcomes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["id", "description"]
            }
          }
        },
        required: ["id", "title", "topics", "learningOutcomes"]
      }
    },
    academicOptimizationTips: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Suggestions for further academic improvement"
    }
  },
  required: ["title", "description", "targetAudience", "totalDuration", "modules", "academicOptimizationTips"]
};

export const generateCurriculum = async (params: GenerationParams): Promise<Curriculum> => {
  const ai = createAI();
  const prompt = `
    Design a comprehensive curriculum for a course on: ${params.subject}.
    Target Level: ${params.level}.
    Industry Alignment: ${params.industryAlignment}.
    Duration: ${params.durationWeeks} weeks.
    Additional Context: ${params.additionalContext}.
    
    Use Google Search to find up-to-date industry trends and skills required for this subject in 2024-2025.
    The response must follow a strict academic structure.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: CURRICULUM_SCHEMA,
        thinkingConfig: { thinkingBudget: 32768 },
        tools: [{ googleSearch: {} }]
      },
    });

    if (!response.text) throw new Error("No response from AI");
    return JSON.parse(response.text) as Curriculum;
  } catch (error) {
    console.error("Error generating curriculum:", error);
    throw error;
  }
};

export const editImage = async (base64Image: string, prompt: string): Promise<string> => {
  const ai = createAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/png' } },
        { text: prompt }
      ]
    }
  });

  // Iterating through all parts to find the image data.
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image returned from AI");
};

export const generateSpeech = async (text: string): Promise<string> => {
  const ai = createAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio returned");
  return base64Audio;
};

export const fastChat = async (message: string): Promise<string> => {
  const ai = createAI();
  const response = await ai.models.generateContent({
    // Use gemini-flash-lite-latest for basic text tasks/flash-lite requests.
    model: 'gemini-flash-lite-latest',
    contents: message,
  });
  return response.text || '';
};
