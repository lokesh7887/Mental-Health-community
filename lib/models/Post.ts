import mongoose, { type Document, Schema } from "mongoose"

export interface IPost extends Document {
  title: string
  content: string
  author: mongoose.Types.ObjectId
  authorName: string
  category: "support" | "discussion" | "resource" | "question" | "story" | "advice"
  tags: string[]
  status: "draft" | "published" | "archived"
  upvotes: number
  downvotes: number
  comments: number
  createdAt: Date
  updatedAt: Date
}

const postSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      maxlength: [10000, "Content cannot exceed 10,000 characters"],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["support", "discussion", "resource", "question", "story", "advice"],
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published",
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    downvotes: {
      type: Number,
      default: 0,
    },
    comments: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

export const Post = mongoose.models.Post || mongoose.model<IPost>("Post", postSchema)
