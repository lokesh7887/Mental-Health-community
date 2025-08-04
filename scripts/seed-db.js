const mongoose = require("mongoose")
require("dotenv").config()

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI environment variable is required")
  process.exit(1)
}

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, required: true },
    category: { type: String, required: true },
    tags: [String],
    status: { type: String, default: "published" },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
  },
  { timestamps: true },
)

const User = mongoose.model("User", userSchema)
const Post = mongoose.model("Post", postSchema)

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log("📦 Connected to MongoDB")

    // Clear existing data
    await User.deleteMany({})
    await Post.deleteMany({})
    console.log("🧹 Cleared existing data")

    // Create sample users
    const users = await User.create([
      {
        username: "supportive_soul",
        email: "user1@mindspace.local",
        password: "password123",
      },
      {
        username: "mindful_warrior",
        email: "user2@mindspace.local",
        password: "password123",
      },
    ])

    // Create sample posts
    await Post.create([
      {
        title: "Dealing with Anxiety in Social Situations",
        content:
          "I've been struggling with social anxiety for years, and I wanted to share some strategies that have helped me cope...",
        author: users[0]._id,
        authorName: users[0].username,
        category: "support",
        tags: ["anxiety", "social-anxiety", "coping-strategies"],
      },
      {
        title: "Mindfulness Meditation Resources",
        content:
          "I've been practicing mindfulness meditation for about two years now, and it's been incredibly helpful...",
        author: users[1]._id,
        authorName: users[1].username,
        category: "resource",
        tags: ["mindfulness", "meditation", "resources"],
      },
    ])

    console.log("✅ Database seeded successfully")
    process.exit(0)
  } catch (error) {
    console.error("❌ Seeding failed:", error)
    process.exit(1)
  }
}

seedDatabase()
