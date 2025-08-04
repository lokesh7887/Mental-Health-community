import mongoose, { type Document, Schema } from "mongoose"

export interface IComment extends Document {
  content: string
  author: mongoose.Types.ObjectId
  authorName: string
  post: mongoose.Types.ObjectId
  upvotes: number
  downvotes: number
  createdAt: Date
  updatedAt: Date
}

const commentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: [true, "Content is required"],
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
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
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    downvotes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

export const Comment = mongoose.models.Comment || mongoose.model<IComment>("Comment", commentSchema)