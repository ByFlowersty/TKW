import { GoogleGenAI, Type } from "@google/genai";
import { IndexingResult } from "../types";

// The API key is injected via environment variables using Vite's import.meta.env
const API_KEY = (import.meta as any).env.VITE_API_KEY;

if (!API_KEY) {
  throw new Error("La clave de API de Gemini no está configurada. Por favor, añádela como VITE_API_KEY al archivo .env");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
};

export const analyzeDocument = async (file: File): Promise<IndexingResult> => {
  const model = "gemini-2.5-flash";

  const filePart = await fileToGenerativePart(file);

  const prompt = `Analiza el siguiente documento. Quiero que TODA tu respuesta, incluyendo el título, el resumen, la categoría y las palabras clave, esté exclusivamente en español. Proporciona un título conciso, un resumen detallado (aproximadamente 150 palabras), una categoría relevante de una lista general (ej: Tecnología, Ciencia, Arte, Historia, Finanzas), una lista de 5 a 7 palabras clave, y una puntuación de relevancia de 0 a 1 que indique el valor del documento para una base de conocimiento. La respuesta DEBE ser únicamente en español.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      summary: { type: Type.STRING },
      category: { type: Type.STRING },
      keywords: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
      relevanceScore: { type: Type.NUMBER },
    },
    required: ["title", "summary", "category", "keywords", "relevanceScore"],
  };

  try {
    const result = await ai.models.generateContent({
      model: model,
      contents: [{ parts: [{ text: prompt }, filePart] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonString = result.text.trim();
    const parsedResult = JSON.parse(jsonString);

    if (
      !parsedResult.title ||
      !parsedResult.summary ||
      !parsedResult.category ||
      !Array.isArray(parsedResult.keywords) ||
      typeof parsedResult.relevanceScore !== "number"
    ) {
      throw new Error("Invalid response structure from Gemini API");
    }

    return parsedResult as IndexingResult;

  } catch (error) {
    console.error("Error analyzing document with Gemini:", error);
    throw new Error("Failed to analyze document. Please try again.");
  }
};


export const getKeywordsForTopic = async (topic: string): Promise<string[]> => {
    const model = "gemini-2.5-flash";
    const prompt = `Basado en el tema de búsqueda del usuario "${topic}", genera una lista de 5 a 10 palabras clave relevantes y diversas que podrían usarse para encontrar documentos relacionados en una base de datos. Las palabras clave deben cubrir sinónimos, conceptos relacionados y términos específicos. La respuesta debe estar exclusivamente en español.`;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            keywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
            },
        },
        required: ["keywords"],
    };

    try {
        const result = await ai.models.generateContent({
            model: model,
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
        const jsonString = result.text.trim();
        const parsedResult = JSON.parse(jsonString);

        if (!Array.isArray(parsedResult.keywords)) {
            throw new Error("Invalid keyword response structure from Gemini API");
        }
        return parsedResult.keywords;
    } catch (error) {
        console.error("Error getting keywords from Gemini:", error);
        // Fallback to a simple split if API fails
        return topic.split(/\s+/);
    }
};