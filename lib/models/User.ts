import mongoose, { type Document, Schema } from "mongoose"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { config } from "../config"

export interface IUser extends Document {
  username: string
  email: string
  password: string
  role: "user" | "admin"
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
  generateJWT(): string
  anonymousId: string
  displayName: string
  getPublicProfile(viewerId?: string): any
  savedPosts: mongoose.Types.ObjectId[]
  upvotedPosts: mongoose.Types.ObjectId[]
  karma: number
  bio: string
  lastActive: Date
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    anonymousId: {
      type: String,
      default: () => `anon_${Math.random().toString(36).slice(2, 9)}`,
      unique: true,
    },
    displayName: {
      type: String,
      default: function() {
        return `Anonymous${this.anonymousId.slice(-4)}`
      }
    },
    savedPosts: [{
      type: Schema.Types.ObjectId,
      ref: 'Post'
    }],
    upvotedPosts: [{
      type: Schema.Types.ObjectId,
      ref: 'Post'
    }],
    karma: {
      type: Number,
      default: 0
    },
    bio: {
      type: String,
      maxlength: 500
    },
    lastActive: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
  },
)

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  const salt = await bcrypt.genSalt(12)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Generate JWT token
userSchema.methods.generateJWT = function (): string {
  return jwt.sign(
    {
      id: this._id,
      username: this.username,
      role: this.role,
    },
    config.jwtSecret,
    { expiresIn: "7d" },
  )
}

// Add method to get public profile
userSchema.methods.getPublicProfile = function(viewerId?: string) {
  const isOwnProfile = viewerId?.toString() === this._id.toString()
  
  if (isOwnProfile) {
    return {
      id: this._id,
      username: this.username,
      email: this.email,
      role: this.role,
      isOwn: true
    }
  }

  return {
    id: this.anonymousId,
    username: this.displayName,
    isOwn: false
  }
}

export const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema)
