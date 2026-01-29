
import { GoogleGenAI, Type } from "@google/genai";

// Access API key from process.env which is shimmed by Vite
const getApiKey = () => {
  try {
    return process.env.API_KEY || '';
  } catch (e) {
    return '';
  }
};

export const analyzeBuildError = async (errorLog: string) => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API_KEY not found in environment");

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `As an autonomous Android Software Engineer, analyze this build error and provide a fix.
    
    Error Log:
    ${errorLog}
    
    Return your response in JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          issueDescription: { type: Type.STRING },
          rootCause: { type: Type.STRING },
          affectedFile: { type: Type.STRING },
          fixCode: { type: Type.STRING },
          explanation: { type: Type.STRING }
        },
        required: ["issueDescription", "rootCause", "affectedFile", "fixCode", "explanation"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateSelfHealingPythonScript = async () => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API_KEY not found in environment");

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Act as an expert Android DevOps engineer. Generate a production-ready Python script that implements an autonomous "Self-Healing" build pipeline.

The script must:
1. Attempt to build an Android project using './gradlew assembleDebug'.
2. Capture stdout and stderr of the process.
3. If the build fails, parse the error output.
4. Include a robust retry loop (maximum 3 attempts).
5. Add a clear placeholder comment for where an LLM (like Gemini) would be invoked to analyze the build error and suggest file modifications.
6. Use standard Python libraries (os, subprocess, sys).
7. Be well-commented and clean.

Output ONLY the Python code. No introductory text or markdown formatting.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt
  });

  if (!response.text) {
    throw new Error("Empty response from AI");
  }

  // Basic cleanup in case markdown blocks were added despite instructions
  return response.text.replace(/```python/g, '').replace(/```/g, '').trim();
};
