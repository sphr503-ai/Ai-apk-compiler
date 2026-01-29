
import { GoogleGenAI, Type } from "@google/genai";

// Access API key from process.env which is shimmed by Vite
const getApiKey = () => {
  try {
    // Vite shims process.env via define in vite.config.ts
    return process.env.API_KEY || '';
  } catch (e) {
    return '';
  }
};

export const analyzeBuildError = async (errorLog: string) => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API_KEY environment variable is not configured.");

  const ai = new GoogleGenAI({ apiKey });
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

  return JSON.parse(response.text);
};

export const generateSelfHealingPythonScript = async () => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API_KEY environment variable is not configured.");

  const ai = new GoogleGenAI({ apiKey });
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

  // Robust cleaning for common LLM output artifacts
  let cleaned = response.text.trim();
  // Remove markdown code blocks if present
  cleaned = cleaned.replace(/^```python\n?/gm, '');
  cleaned = cleaned.replace(/^```\n?/gm, '');
  cleaned = cleaned.replace(/\n?```$/gm, '');
  
  return cleaned;
};
