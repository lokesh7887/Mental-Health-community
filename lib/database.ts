import mongoose from "mongoose"
import { config } from "./config"

interface ConnectionState {
  isConnected: boolean
}

const connection: ConnectionState = {
  isConnected: false,
}

export async function connectToDatabase() {
  if (connection.isConnected) {
    return
  }

  try {
    const db = await mongoose.connect(config.mongodbUri)
    connection.isConnected = db.connections[0].readyState === 1
    console.log("MongoDB connected successfully")
  } catch (error) {
    console.error("MongoDB connection failed:", error)
    throw error
  }
}

export async function disconnectFromDatabase() {
  if (!connection.isConnected) {
    return
  }

  try {
    await mongoose.disconnect()
    connection.isConnected = false
    console.log("MongoDB disconnected")
  } catch (error) {
    console.error("MongoDB disconnection failed:", error)
    throw error
  }
}
