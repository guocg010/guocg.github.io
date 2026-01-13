
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedInfo } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const extractInformation = async (text: string): Promise<ExtractedInfo> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `请从以下文本中提取信息： "${text}"`,
    config: {
      systemInstruction: `你是一个专业的品质数据提取助手。
请从用户提供的文本中准确提取以下字段：
1. 名称 (name)
2. 件号 (partNumber)
3. 是否客服返修件 (isCustomerReturn): 识别为"新品"或"返修件"。
4. 供应商名称 (supplierName)
5. 问题点 (problemPoint)
6. 不良批次 (defectBatch)
7. 不良数量 (defectQuantity): 提取为数字或带单位的字符串（如 "1" 或 "1个"）。

输出必须是严格的 JSON 格式，不要包含任何 Markdown 代码块包裹。`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          partNumber: { type: Type.STRING },
          isCustomerReturn: { type: Type.STRING },
          supplierName: { type: Type.STRING },
          problemPoint: { type: Type.STRING },
          defectBatch: { type: Type.STRING },
          defectQuantity: { type: Type.STRING },
        },
        required: ["name", "partNumber", "isCustomerReturn", "supplierName", "problemPoint", "defectBatch", "defectQuantity"],
      },
    },
  });

  const textResponse = response.text;
  if (!textResponse) {
    throw new Error("Failed to get response from AI");
  }

  try {
    return JSON.parse(textResponse) as ExtractedInfo;
  } catch (e) {
    console.error("JSON Parse Error:", textResponse);
    throw new Error("AI 返回格式错误");
  }
};
