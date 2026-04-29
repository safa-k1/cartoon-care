export async function generateAudio(text, apiKey) {
  const voiceId = "EXAVITQu4vr4xnSDxMaL"

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.75, similarity_boost: 0.85 },
      }),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    console.error("ElevenLabs Error", errorText)
    throw new Error("ElevenLabs failed")
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}