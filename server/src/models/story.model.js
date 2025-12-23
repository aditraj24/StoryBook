import mongoose, { Schema } from "mongoose";

const mediaSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["text", "image", "video", "audio"],
      required: true,
    },
    content: String,
    url: String,
    publicId: String,
  },
  { _id: false }
);

const storySchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
    },
    place: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    media: [mediaSchema],

    // OWNER (who created the story)
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

export const Story = mongoose.model("Story", storySchema);
