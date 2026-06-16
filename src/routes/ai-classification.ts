/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";

const router = express.Router();
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Waste categories mapping
const WASTE_CATEGORIES = {
  "e-waste": { pricePerKg: 5.0, pointsPerKg: 50 },
  plastic: { pricePerKg: 1.5, pointsPerKg: 15 },
  metal: { pricePerKg: 2.5, pointsPerKg: 25 },
  paper: { pricePerKg: 0.5, pointsPerKg: 5 },
  glass: { pricePerKg: 0.3, pointsPerKg: 3 },
  organic: { pricePerKg: 0.2, pointsPerKg: 2 },
};

// Classify waste from image
router.post("/classify", async (req: Request, res: Response) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Image data is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ error: "AI API key not configured" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    // Create the prompt for waste classification
    const prompt = `You are an expert waste classification specialist. Analyze the image and:
1. Identify the type of waste (e-waste, plastic, metal, paper, glass, organic)
2. Estimate the weight category (small: <1kg, medium: 1-5kg, large: 5-10kg, very large: >10kg)
3. Provide a confidence score (0-100)
4. Suggest the matching vendor category

Respond in JSON format:
{
  "category": "string",
  "confidence": number,
  "estimatedWeightCategory": "string",
  "description": "string"
}`;

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: imageBase64,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
    });

    const responseText =
      result.response.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(400).json({
        error: "Could not classify image",
        details: "Invalid AI response format",
      });
    }

    const classification = JSON.parse(jsonMatch[0]);
    const category = classification.category.toLowerCase();
    const categoryData =
      WASTE_CATEGORIES[category as keyof typeof WASTE_CATEGORIES];

    // Estimate weight based on category
    const estimatedWeight =
      classification.estimatedWeightCategory === "small"
        ? 0.5
        : classification.estimatedWeightCategory === "medium"
          ? 3
          : classification.estimatedWeightCategory === "large"
            ? 7
            : 12;

    const result_data = {
      category: classification.category,
      confidence: classification.confidence,
      estimatedWeight,
      estimatedPayout: estimatedWeight * (categoryData?.pricePerKg || 1),
      pointsAwarded: Math.floor(
        estimatedWeight * (categoryData?.pointsPerKg || 10)
      ),
      matchVendorName: `${category.charAt(0).toUpperCase() + category.slice(1)} Specialists`,
    };

    res.json({ success: true, ...result_data });
  } catch (error) {
    console.error("Classification error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get waste categories
router.get("/categories", (req: Request, res: Response) => {
  try {
    const categories = Object.entries(WASTE_CATEGORIES).map(
      ([key, value]) => ({
        id: key,
        name: key.charAt(0).toUpperCase() + key.slice(1),
        pricePerKg: value.pricePerKg,
        pointsPerKg: value.pointsPerKg,
      })
    );

    res.json(categories);
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
