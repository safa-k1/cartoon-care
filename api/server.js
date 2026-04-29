import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { generateStory } from "./generate.js"
import { generateAudio } from "./speech.js"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.post("/api/story", async (req, res) => {
  try {
    const { name, age, condition, language } = req.body

    if (!name || !age || !condition) {
      return res.status(400).json({
        success: false,
        error: "Missing name, age, or condition"
      })
    }

    const story = await generateStory({ name, age, condition, language })
    res.json({ success: true, story })

  } catch (err) {
    console.error("Story Error", err.message)
    res.status(500).json({ success: false, error: err.message })
  }
})

app.post("/api/audio", async (req, res) => {
  try {
    const { text } = req.body
    if (!text) return res.status(400).json({ error: "No text provided" })

    const audioBuffer = await generateAudio(text, process.env.ELEVENLABS_API_KEY)
    res.set("Content-Type", "audio/mpeg")
    res.send(audioBuffer)
  } catch (err) {
    console.error("Audio Error", err.message)
    res.status(500).json({ error: err.message })
  }
})

app.get("/health", (req, res) => {
  res.json({ status: "ok" })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})