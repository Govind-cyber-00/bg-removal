import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import connectDB from './configs/mongodb.js'
import userRouter from './routes/userRoutes.js'

const app = express()

app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
  res.send("API Working 🚀")
})
app.use('/api/user',userRouter)
app.get('/api/test', async (req, res) => {
  try {
    await connectDB()
    res.json({ success: true, message: "API working and DB connected" })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

export default app