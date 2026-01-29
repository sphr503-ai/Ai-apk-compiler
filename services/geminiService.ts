
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeBuildError = async (errorLog: string) => {
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
  const prompt = `Generate a high-level Python script that handles the "Self-Healing" build logic for an Android project. 
  The script should:
  1. Execute ./gradlew assembleDebug and capture stdout/stderr.
  2. If return code != 0, extract the error.
  3. Placeholder for calling an LLM API to get the fix.
  4. Apply the suggested fix to the source file.
  5. Retry the build up to 3 times.
  
  Format the output as a clean Python script.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt
  });

  return response.text;
};
