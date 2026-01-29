
import { GoogleGenAI, Type } from "@google/genai";

// Removed getApiKey helper. API key must be accessed exclusively from process.env.API_KEY.

export const analyzeBuildError = async (errorLog: string) => {
  // Use API key directly from process.env.API_KEY as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `As an autonomous Android Software Engineer, analyze this build error and provide a fix.
    
    Error Context:
    ${errorLog}
    
    Format your response in JSON according to the schema.`,
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

  // response.text is a property, not a method.
  return JSON.parse(response.text);
};

export const generateSelfHealingPythonScript = async () => {
  // Use API key directly from process.env.API_KEY as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Act as an expert Android DevOps engineer. Generate a production-grade Python 3 script named 'heal_build.py' that implements an autonomous "Self-Healing" build pipeline.

Technical Requirements:
1. Orchestrate './gradlew assembleDebug' using subprocess.
2. Capture and process both stdout and stderr.
3. If build fails (retCode != 0), extract the relevant error block.
4. Implement a 3-attempt retry loop.
5. Include structured comments/placeholders for where a Large Language Model (LLM) API would be integrated to analyze the error logs and apply targeted file modifications.
6. Use only Python Standard Library (os, subprocess, sys, re, time).
7. Ensure error handling is robust (e.g., if gradlew is missing permissions).

Output ONLY the raw source code. No conversational text, no markdown backticks, no markdown formatting.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt
  });

  if (!response.text) {
    throw new Error("AI generation yielded an empty response.");
  }

  let cleaned = response.text.trim();
  cleaned = cleaned.replace(/^```python\n?/gm, '');
  cleaned = cleaned.replace(/^```\n?/gm, '');
  cleaned = cleaned.replace(/\n?```$/gm, '');
  
  return cleaned;
};
