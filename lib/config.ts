interface Config {
  // Server
  nodeEnv: string
  port: number

  // Database
  mongodbUri: string
  mongodbTestUri: string

  // Authentication
  jwtSecret: string
  jwtExpire: string

  // API Keys
  openrouterApiKey: string

  // CORS
  allowedOrigins: string[]

  // Features
  enableMoodAnalysis: boolean
  enableAiSuggestions: boolean
  enableRealTimeChat: boolean
  enableCommunityFeatures: boolean

  // Logging
  logLevel: string
  enableDebugLogging: boolean

  // Rate Limiting
  rateLimitWindowMs: number
  rateLimitMaxRequests: number

  // File Upload
  maxFileSize: number
  allowedFileTypes: string[]

  // External Services
  sentryDsn?: string
  redisUrl?: string
}

function validateConfig(): Config {
  const requiredVars = ["JWT_SECRET", "MONGODB_URI", "OPENROUTER_API_KEY"]
  const missingVars = requiredVars.filter((varName) => !process.env[varName])

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`)
  }

  return {
    // Server
    nodeEnv: process.env.NODE_ENV || "development",
    port: Number.parseInt(process.env.PORT || "3000", 10),

    // Database
    mongodbUri: process.env.MONGODB_URI!,
    mongodbTestUri: process.env.MONGODB_TEST_URI || process.env.MONGODB_URI!,

    // Authentication
    jwtSecret: process.env.JWT_SECRET!,
    jwtExpire: process.env.JWT_EXPIRE || "7d",

    // API Keys
    openrouterApiKey: process.env.OPENROUTER_API_KEY!,

    // CORS
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"],

    // Features
    enableMoodAnalysis: process.env.ENABLE_MOOD_ANALYSIS === "true",
    enableAiSuggestions: process.env.ENABLE_AI_SUGGESTIONS === "true",
    enableRealTimeChat: process.env.ENABLE_REAL_TIME_CHAT === "true",
    enableCommunityFeatures: process.env.ENABLE_COMMUNITY_FEATURES === "true",

    // Logging
    logLevel: process.env.LOG_LEVEL || "info",
    enableDebugLogging: process.env.ENABLE_DEBUG_LOGGING === "true",

    // Rate Limiting
    rateLimitWindowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
    rateLimitMaxRequests: Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),

    // File Upload
    maxFileSize: Number.parseInt(process.env.MAX_FILE_SIZE || "10485760", 10),
    allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(",") || [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ],

    // External Services
    sentryDsn: process.env.SENTRY_DSN,
    redisUrl: process.env.REDIS_URL,
  }
}

function getConfig(): Config {
  // Validate required environment variables
  const config = validateConfig()

  return {
    ...config,

    // Database
    mongodbTestUri: process.env.MONGODB_TEST_URI || process.env.MONGODB_URI!,

    // Authentication
    jwtExpire: process.env.JWT_EXPIRE || "7d",

    // Features
    enableMoodAnalysis: process.env.ENABLE_MOOD_ANALYSIS === "true",
    enableAiSuggestions: process.env.ENABLE_AI_SUGGESTIONS === "true",
    enableRealTimeChat: process.env.ENABLE_REAL_TIME_CHAT === "true",
    enableCommunityFeatures: process.env.ENABLE_COMMUNITY_FEATURES === "true",

    // Logging
    logLevel: process.env.LOG_LEVEL || "info",
    enableDebugLogging: process.env.ENABLE_DEBUG_LOGGING === "true",

    // Rate Limiting
    rateLimitWindowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10), // 15 minutes
    rateLimitMaxRequests: Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),

    // File Upload
    maxFileSize: Number.parseInt(process.env.MAX_FILE_SIZE || "10485760", 10), // 10MB
    allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(",") || [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ],

    // External Services
    sentryDsn: process.env.SENTRY_DSN,
    redisUrl: process.env.REDIS_URL,
  }
}

// Export singleton config instance
export const config = getConfig()

// Helper functions for environment checks
export const isDevelopment = () => config.nodeEnv === "development"
export const isProduction = () => config.nodeEnv === "production"
export const isTest = () => config.nodeEnv === "test"

// Validate configuration on import
if ((isProduction() && config.jwtSecret.includes("dev-")) || config.jwtSecret.includes("change-in-production")) {
  console.warn("⚠️  WARNING: Using development JWT secret in production!")
}

if (!config.openrouterApiKey.startsWith("sk-or-v1-")) {
  console.warn("⚠️  WARNING: OpenRouter API key format may be incorrect")
}

export default config
