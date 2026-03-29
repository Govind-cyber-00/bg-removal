import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import connectDB from './configs/mongodb.js'

// App Config
const app = express()

// Connect DB
await connectDB()

// Middlewares
app.use(express.json())
app.use(cors())

// Routes
app.get('/', (req, res) => res.send("API Working"))
app.get('/api/test', (req, res) => res.json({ success: true, message: "API is working" }))

export default app