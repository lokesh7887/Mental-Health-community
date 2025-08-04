const requiredVars = ["JWT_SECRET", "MONGODB_URI", "OPENROUTER_API_KEY"]

function checkEnvironmentVariables() {
  console.log("🔍 Checking environment variables...\n")

  let hasErrors = false

  console.log("✅ Required Variables:")
  requiredVars.forEach((varName) => {
    const value = process.env[varName]
    if (!value) {
      console.log(`❌ ${varName}: MISSING`)
      hasErrors = true
    } else {
      const maskedValue =
        varName.includes("SECRET") || varName.includes("KEY") ? "*".repeat(Math.min(value.length, 8)) : value
      console.log(`✅ ${varName}: ${maskedValue}`)
    }
  })

  console.log("\n🔒 Security Checks:")
  const jwtSecret = process.env.JWT_SECRET
  if (jwtSecret) {
    if (jwtSecret.length < 32) {
      console.log("❌ JWT_SECRET: Too short (should be at least 32 characters)")
      hasErrors = true
    } else {
      console.log("✅ JWT_SECRET: Looks secure")
    }
  }

  console.log("\n📊 Summary:")
  if (hasErrors) {
    console.log("❌ Environment check FAILED - missing required variables")
    process.exit(1)
  } else {
    console.log("✅ Environment check PASSED - all variables configured correctly")
    process.exit(0)
  }
}

require("dotenv").config()
checkEnvironmentVariables()
