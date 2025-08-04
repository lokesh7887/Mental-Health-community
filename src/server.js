const express = require("express")
const mongoose = require("mongoose")
require("express-async-errors")
require("dotenv").config()

const config = require("./config/database")
const logger = require("./utils/logger")
const { errorHandler, notFound } = require("./middleware/errorMiddleware")
const { setupMiddleware } = require("./middleware/setupMiddleware")
const routes = require("./routes")

class Server {
  constructor() {
    this.app = express()
    this.port = process.env.PORT || 3000
    this.setupMiddleware()
    this.setupRoutes()
    this.setupErrorHandling()
  }

  setupMiddleware() {
    setupMiddleware(this.app)
  }

  setupRoutes() {
    this.app.use("/api", routes)

    // Health check endpoint
    this.app.get("/health", (req, res) => {
      res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
      })
    })
  }

  setupErrorHandling() {
    this.app.use(notFound)
    this.app.use(errorHandler)
  }

  async connectDatabase() {
    try {
      await mongoose.connect(config.mongoUri, config.options)
      logger.info("MongoDB connected successfully")
    } catch (error) {
      logger.error("MongoDB connection failed:", error)
      process.exit(1)
    }
  }

  async start() {
    try {
      await this.connectDatabase()

      this.server = this.app.listen(this.port, () => {
        logger.info(`Server running on port ${this.port} in ${process.env.NODE_ENV || "development"} mode`)
      })

      // Graceful shutdown
      this.setupGracefulShutdown()

      return this.server
    } catch (error) {
      logger.error("Failed to start server:", error)
      process.exit(1)
    }
  }

  setupGracefulShutdown() {
    const gracefulShutdown = async (signal) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`)

      if (this.server) {
        this.server.close(async () => {
          logger.info("HTTP server closed")

          try {
            await mongoose.connection.close()
            logger.info("MongoDB connection closed")
            process.exit(0)
          } catch (error) {
            logger.error("Error during shutdown:", error)
            process.exit(1)
          }
        })
      }
    }

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))
    process.on("SIGINT", () => gracefulShutdown("SIGINT"))
  }
}

// Start server if this file is run directly
if (require.main === module) {
  const server = new Server()
  server.start()
}

module.exports = Server
