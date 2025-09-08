import { GoogleGenAI, Type } from "@google/genai";
import type { ArbitrageOpportunity, GeminiAnalysis } from '../types';

const getGenAIClient = (): GoogleGenAI | null => {
  const apiKey = localStorage.getItem('geminiApiKey');
  if (!apiKey) {
    console.warn("Gemini API key not found in local storage. Please set it on the Settings page.");
    alert("Gemini API key not set. Please add it in the Settings page to use AI features.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeOpportunity = async (opportunity: ArbitrageOpportunity): Promise<GeminiAnalysis | null> => {
  const ai = getGenAIClient();
  if (!ai) return null;

  try {
    const prompt = `
      Analyze the following e-commerce arbitrage opportunity and provide a risk assessment.
      Product: ${opportunity.productName}
      Source (eBay) Price: £${opportunity.ebayPrice}
      Destination (Amazon) Price: £${opportunity.amazonPrice}
      Potential Profit: £${opportunity.potentialProfit}
      
      Consider factors like:
      - Product category risks (e.g., high returns for electronics/clothing).
      - Price volatility.
      - Potential for authenticity issues if not from an authorized dealer.
      - Brand gating or restrictions on Amazon for this product or brand.
      - Competition from other sellers.
      
      Provide a risk score from 1 (low risk) to 10 (high risk) and a brief summary.
      Also list potential issues as an array of strings.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskScore: { type: Type.INTEGER, description: "A risk score from 1 to 10." },
            summary: { type: Type.STRING, description: "A brief summary of the analysis." },
            potentialIssues: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of potential issues or risks."
            }
          },
          required: ["riskScore", "summary", "potentialIssues"]
        }
      }
    });

    const jsonText = response.text.trim();
    const analysisResult: GeminiAnalysis = JSON.parse(jsonText);
    return analysisResult;

  } catch (error) {
    console.error("Error analyzing opportunity with Gemini:", error);
    alert("An error occurred while analyzing the opportunity. Check the console for details.");
    return null;
  }
};

export const generateListingDescription = async (opportunity: ArbitrageOpportunity): Promise<string | null> => {
  const ai = getGenAIClient();
  if (!ai) return null;
  
  try {
    const prompt = `
      Generate a compelling and professional eBay listing description for the following product.
      The description should be formatted for readability on mobile devices, using bullet points for key features.
      Start with a strong opening sentence. Highlight the product's benefits.
      Do not mention the price, shipping, or seller details.
      
      Product Name: ${opportunity.productName}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error generating listing description with Gemini:", error);
    alert("An error occurred while generating the description. Check the console for details.");
    return null;
  }
};