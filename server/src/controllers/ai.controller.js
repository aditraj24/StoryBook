import Groq from "groq-sdk";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const aiController = asyncHandler(async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || !prompt.trim()) {
    throw new ApiError(400, "Prompt is required");
  }

  try {
    const completion = await groq.chat.completions.create({
      model: "groq/compound", // ✅ FREE + FAST
      messages: [
        {
          role: "system",
          content: "You are StoryBot, a helpful AI that writes creative stories.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 500,
    });

    const aiText = completion.choices[0].message.content;

    return res.status(200).json(
      new ApiResponse(
        200,
        { reply: aiText },
        "AI response generated successfully"
      )
    );
  } catch (error) {
    console.error("Groq API Error:", error.message);
    throw new ApiError(500, "AI generation failed");
  }
});
