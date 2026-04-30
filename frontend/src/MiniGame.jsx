import { useState, useEffect, useRef } from "react";
import "./MiniGame.css";

const ELEVENLABS_VOICE_ID = "EXAVITQu4vr4xnSDxMaL";
const ELEVENLABS_API_KEY  = import.meta.env.VITE_ELEVENLABS_API_KEY;

// ─── ElevenLabs audio helper ─────────────────────────────
async function speak(text) {
  console.log("[ElevenLabs] API key present:", !!ELEVENLABS_API_KEY);
  console.log("[ElevenLabs] Key prefix:", ELEVENLABS_API_KEY?.substring(0, 8));
  try {
    if (!ELEVENLABS_API_KEY) throw new Error("No VITE_ELEVENLABS_API_KEY in .env");
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
      {
        method: "POST",
        headers: { "xi-api-key": ELEVENLABS_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.75, similarity_boost: 0.85 },
        }),
      }
    );
    console.log("[ElevenLabs] Status:", res.status);
    if (!res.ok) {
      const err = await res.text();
      console.error("[ElevenLabs] Error body:", err);
      throw new Error("ElevenLabs failed: " + err);
    }
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    return new Promise((resolve) => {
      const audio = new Audio(url);
      audio.onended = () => { URL.revokeObjectURL(url); resolve(); };
      audio.onerror = () => { resolve(); };
      audio.play();
    });
  } catch (e) {
    console.warn("[ElevenLabs] Falling back to browser TTS. Reason:", e.message);
    // Fallback: browser TTS
    return new Promise((resolve) => {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.88; u.pitch = 1.2;
      u.onend = resolve;
      u.onerror = resolve;
      window.speechSynthesis.speak(u);
    });
  }
}

// ─── Game data — 3 steps each (2 correct, 1 wrong) ───────
const miniGames = {
  asthma: {
    title: "Help Maya use her inhaler!",
    emoji: "💨",
    intro: "Oh no! Maya is having trouble breathing. Listen carefully and tap the right steps to help her!",
    steps: [
      { text: "Shake the inhaler gently",    correct: true,  audio: "Option 1. Shake the inhaler gently. Give it a good shake!" },
      { text: "Press and breathe in slowly", correct: true,  audio: "Option 2. Press the inhaler and breathe in slowly and deeply." },
      { text: "Run around really fast",      correct: false, audio: "Option 3. Run around really fast." },
    ],
    successMessage: "Amazing! Maya can breathe freely again! You're a real hero!",
    successAudio: "Amazing! Maya can breathe freely again! You are a real hero! The Care Bears are so proud of you!",
  },
  fever: {
    title: "Help Lily cool down!",
    emoji: "🌡️",
    intro: "Lily has a fever and feels really hot. Listen to each step and tap the good ones to help her!",
    steps: [
      { text: "Drink plenty of water",       correct: true,  audio: "Option 1. Drink plenty of cool water. Staying hydrated is so important!" },
      { text: "Rest under a light blanket",  correct: true,  audio: "Option 2. Rest under a light blanket. Not too heavy!" },
      { text: "Run around outside",          correct: false, audio: "Option 3. Run around outside." },
    ],
    successMessage: "Wonderful! Lily's fever is going down! You're amazing!",
    successAudio: "Wonderful! Lily's fever is going down and she feels so much better! You are absolutely amazing!",
  },
  vomiting: {
    title: "Help Ethan's tummy!",
    emoji: "🍵",
    intro: "Poor Ethan's tummy is upset. Listen carefully and tap the right choices to help him feel better!",
    steps: [
      { text: "Take tiny sips of water",    correct: true,  audio: "Option 1. Take tiny sips of water. Small and slow is the way to go!" },
      { text: "Rest and stay still",        correct: true,  audio: "Option 2. Rest and stay still. Let your tummy settle down." },
      { text: "Eat a huge meal right away", correct: false, audio: "Option 3. Eat a huge meal right away." },
    ],
    successMessage: "Great job! Ethan's tummy is feeling so much better!",
    successAudio: "Great job! Ethan's tummy is calming down and he feels so much better. You are a superstar!",
  },
  allergy: {
    title: "Help Zoe stop sneezing!",
    emoji: "🌸",
    intro: "Zoe's allergies are acting up! Listen to each choice and tap the right ones to help her feel better!",
    steps: [
      { text: "Take allergy medicine",      correct: true,  audio: "Option 1. Take allergy medicine. This helps calm your body's reaction!" },
      { text: "Wear sunglasses outside",    correct: true,  audio: "Option 2. Wear sunglasses outside to keep pollen away from your eyes!" },
      { text: "Roll around in flowers",     correct: false, audio: "Option 3. Roll around in flowers." },
    ],
    successMessage: "Perfect! Zoe can enjoy spring again! You're so clever!",
    successAudio: "Perfect! Zoe can enjoy the beautiful spring day again! You are so incredibly clever!",
  },
  flu: {
    title: "Help Jake fight the flu!",
    emoji: "🦠",
    intro: "Jake has the flu and feels really achy. Listen carefully and help him fight it the right way!",
    steps: [
      { text: "Drink lots of water",        correct: true,  audio: "Option 1. Drink lots of water and juice. Keep that body hydrated!" },
      { text: "Get plenty of rest",         correct: true,  audio: "Option 2. Rest and sleep as much as you can. Your body heals when you sleep!" },
      { text: "Go to school anyway",        correct: false, audio: "Option 3. Go to school anyway to see friends." },
    ],
    successMessage: "Awesome! Jake is on the mend and feeling stronger!",
    successAudio: "Awesome! Jake is getting better every hour! You helped him fight the flu like a true champion!",
  },
  cough: {
    title: "Help Carlos soothe his cough!",
    emoji: "🍯",
    intro: "Carlos has a tickly cough that won't stop. Listen and tap the good choices to help him!",
    steps: [
      { text: "Drink warm honey tea",       correct: true,  audio: "Option 1. Warm honey tea is magic for a cough! Sip it slowly." },
      { text: "Sleep with an extra pillow", correct: true,  audio: "Option 2. An extra pillow helps you breathe better while you sleep!" },
      { text: "Yell and scream loudly",     correct: false, audio: "Option 3. Yell and scream as loudly as possible." },
    ],
    successMessage: "Well done! Carlos's cough is all better now!",
    successAudio: "Well done! Carlos's cough is so much better and he can finally rest. You are wonderfully kind!",
  },
  headache: {
    title: "Help Mia beat her headache!",
    emoji: "💧",
    intro: "Mia has a bad headache. Listen carefully to each option and tap the right ones to help her!",
    steps: [
      { text: "Drink a big glass of water", correct: true,  audio: "Option 1. Drink a big glass of water. Most headaches come from not enough water!" },
      { text: "Rest in a quiet dark room",  correct: true,  audio: "Option 2. Rest in a quiet dark room. Darkness helps headaches so much!" },
      { text: "Stare at a bright screen",   correct: false, audio: "Option 3. Stare at a bright screen." },
    ],
    successMessage: "Perfect! Mia's headache is completely gone! Brilliant!",
    successAudio: "Perfect! Mia's headache has melted away and she feels wonderful again! You are so brilliant!",
  },
  earache: {
    title: "Help Sam's ear feel better!",
    emoji: "🎵",
    intro: "Sam's ear really hurts. Listen to each step and tap the right ones to help Sam feel better!",
    steps: [
      { text: "Take medicine from the doctor",  correct: true,  audio: "Option 1. Take the medicine the doctor prescribed. This fights the infection!" },
      { text: "Hold a warm cloth on the ear",   correct: true,  audio: "Option 2. A warm cloth on the ear feels so soothing. Gentle warmth helps!" },
      { text: "Poke inside your ear",           correct: false, audio: "Option 3. Poke inside your ear." },
    ],
    successMessage: "Great! Sam is back to hearing music clearly! You're a star!",
    successAudio: "Great job! Sam's ear is feeling so much better and the music sounds beautiful again! You are an absolute star!",
  },
  acne: {
    title: "Help Alex care for their skin!",
    emoji: "✨",
    intro: "Alex wants to take great care of their skin. Listen carefully and choose the right steps!",
    steps: [
      { text: "Wash face gently twice a day", correct: true,  audio: "Option 1. Wash your face gently twice a day. Morning and night!" },
      { text: "Apply the doctor's cream",     correct: true,  audio: "Option 2. Apply the cream the doctor gave you. It really works!" },
      { text: "Squeeze pimples hard",         correct: false, audio: "Option 3. Squeeze the pimples as hard as you can." },
    ],
    successMessage: "Amazing! Alex feels confident and glowing! You're wonderful!",
    successAudio: "Amazing! Alex feels so confident and their skin is getting healthier every day! You are truly wonderful!",
  },
};

// ─── Accessibility Intro Screen ───────────────────────────
function EyesClosedIntro({ onReady, onSkip, bearImg }) {
  const [countdown, setCountdown] = useState(null);
  const [phase, setPhase] = useState("prompt"); // prompt | countdown | ready

  async function handleCloseEyes() {
    setPhase("countdown");
    await speak("Close your eyes... The game will start in 3... 2... 1... Go!");
    setCountdown(3);
  }

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setPhase("ready");
      onReady();
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  return (
    <div className="eyes-intro">
      <div className="eyes-bears">
        {bearImg && (
          <img src={bearImg} alt="Care Bear" className="eyes-bear-img" />
        )}
      </div>

      {phase === "prompt" && (
        <>
          <div className="eyes-title">✨ Accessibility Challenge! ✨</div>
          <p className="eyes-desc">
            Can you play this game with your <strong>eyes closed</strong>?<br />
            Your Care Bear will read every option out loud!<br />
            Listen carefully and tap what you hear! 🎧
          </p>
          <div className="eyes-btns">
            <button className="eyes-btn eyes-btn--main" onClick={handleCloseEyes}>
              😌 Close My Eyes & Play!
            </button>
            <button className="eyes-btn eyes-btn--skip" onClick={onSkip}>
              👀 Play Normally
            </button>
          </div>
        </>
      )}

      {phase === "countdown" && (
        <div className="eyes-countdown-wrap">
          <div className="eyes-countdown-label">Close your eyes!</div>
          <div className="eyes-counting">Get ready...</div>
        </div>
      )}
    </div>
  );
}

// ─── Main MiniGame ────────────────────────────────────────
export default function MiniGame({ condition, bearImg }) {
  const game = miniGames[condition?.toLowerCase()];

  const [phase, setPhase]         = useState("intro");   // intro | playing | success
  const [eyesClosed, setEyesClosed] = useState(false);
  const [clicked, setClicked]     = useState([]);
  const [reading, setReading]     = useState(false);      // true while audio plays
  const [activeIdx, setActiveIdx] = useState(null);       // which button is being read
  const [score, setScore]         = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [hasReadIntro, setHasReadIntro] = useState(false);
  const playingRef = useRef(false);

  if (!game) return null;

  const totalCorrect = game.steps.filter(s => s.correct).length;
  const correctClicked = clicked.filter(i => game.steps[i].correct).length;
  const progress = Math.round((correctClicked / totalCorrect) * 100);

  // Read the intro aloud when game starts
  useEffect(() => {
    if (phase === "playing" && !hasReadIntro) {
      setHasReadIntro(true);
      speak(game.intro).then(() => {
        if (eyesClosed) readAllOptions();
      });
    }
  }, [phase]);

  // Read all options one by one for eyes-closed mode
  async function readAllOptions() {
    if (playingRef.current) return;
    playingRef.current = true;
    setReading(true);
    for (let i = 0; i < game.steps.length; i++) {
      if (clicked.includes(i)) continue;
      setActiveIdx(i);
      await speak(`Option ${i + 1}: ${game.steps[i].text}`);
      await new Promise(r => setTimeout(r, 300));
    }
    setActiveIdx(null);
    setReading(false);
    playingRef.current = false;
  }

  async function handleClick(index) {
    if (clicked.includes(index) || reading) return;

    const step = game.steps[index];

    // Play this step's audio
    setReading(true);
    await speak(step.audio);
    setReading(false);

    const newClicked = [...clicked, index];
    setClicked(newClicked);

    if (step.correct) {
      setScore(s => s + 1);
      const newCorrect = newClicked.filter(i => game.steps[i].correct).length;
      if (newCorrect >= totalCorrect) {
        await speak(game.successAudio);
        setPhase("success");
      } else if (eyesClosed) {
        // Continue reading remaining options
        readAllOptions();
      }
    } else {
      setWrongCount(w => w + 1);
      if (eyesClosed) {
        await new Promise(r => setTimeout(r, 400));
        readAllOptions();
      }
    }
  }

  function handleReset() {
    setClicked([]);
    setPhase("intro");
    setScore(0);
    setWrongCount(0);
    setEyesClosed(false);
    setHasReadIntro(false);
    setActiveIdx(null);
    playingRef.current = false;
  }

  function handleReadAgain() {
    if (!reading) readAllOptions();
  }

  // ── Intro screen ──
  if (phase === "intro") {
    return (
      <EyesClosedIntro
        bearImg={bearImg}
        onReady={() => { setEyesClosed(true); setPhase("playing"); }}
        onSkip={() => { setEyesClosed(false); setPhase("playing"); }}
      />
    );
  }

  // ── Success screen ──
  if (phase === "success") {
    const perfect = wrongCount === 0;
    return (
      <div className="minigame minigame--success-state">
        <div className="mg-success-top">
          {bearImg && <img src={bearImg} alt="Care Bear" className="mg-success-bear" />}
          <div className="mg-trophy">{perfect ? "🏆" : "🌟"}</div>
        </div>
        <p className="mg-success-title">{game.successMessage}</p>
        <div className="mg-stats">
          <div className="mg-stat">
            <span className="mg-stat-num">{totalCorrect}</span>
            <span className="mg-stat-label">correct choices</span>
          </div>
          <div className="mg-stat">
            <span className="mg-stat-num" style={{ color: wrongCount > 0 ? "#e879a0" : "#10b981" }}>{wrongCount}</span>
            <span className="mg-stat-label">wrong taps</span>
          </div>
          {eyesClosed && (
            <div className="mg-stat">
              <span className="mg-stat-num">😌</span>
              <span className="mg-stat-label">eyes closed!</span>
            </div>
          )}
        </div>
        {perfect && (
          <div className="mg-perfect-badge">
            ⭐ Perfect Score! ⭐
          </div>
        )}
        {eyesClosed && (
          <div className="mg-eyes-badge">
            😌 Completed with eyes closed! Amazing accessibility hero!
          </div>
        )}
        <button className="minigame-reset" onClick={handleReset}>
          🔄 Play Again
        </button>
      </div>
    );
  }

  // ── Playing screen ──
  return (
    <div className={`minigame ${eyesClosed ? "minigame--eyes-closed" : ""}`}>
      {/* Header */}
      <div className="mg-header">
        <div className="mg-title-row">
          <span className="mg-emoji">{game.emoji}</span>
          <h3 className="minigame-title">{game.title}</h3>
        </div>
        {eyesClosed && (
          <div className="mg-eyes-mode-badge">😌 Eyes Closed Mode</div>
        )}
      </div>

      {/* Progress bar */}
      <div className="mg-progress-wrap">
        <div className="mg-progress-bar">
          <div className="mg-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="mg-progress-label">{correctClicked} / {totalCorrect} ✓</span>
      </div>

      <p className="minigame-hint">
        {eyesClosed
          ? "🎧 Listen carefully and tap the right choices!"
          : "👆 Tap all the right choices to help!"}
      </p>

      {/* Read again button (eyes-closed mode) */}
      {eyesClosed && (
        <button
          className="mg-read-again-btn"
          onClick={handleReadAgain}
          disabled={reading}
        >
          {reading ? "🔊 Reading..." : "🔊 Read Options Again"}
        </button>
      )}

      {/* Steps */}
      <div className="minigame-steps">
        {game.steps.map((step, i) => {
          const isClicked  = clicked.includes(i);
          const isCorrect  = step.correct;
          const isActive   = activeIdx === i;

          let btnClass = "minigame-btn";
          if (isActive)        btnClass += " minigame-btn--reading";
          else if (isClicked && isCorrect)  btnClass += " minigame-btn--correct";
          else if (isClicked && !isCorrect) btnClass += " minigame-btn--wrong";

          return (
            <button
              key={i}
              className={btnClass}
              onClick={() => handleClick(i)}
              disabled={isClicked || reading}
              aria-label={`Option ${i + 1}: ${step.text}`}
            >
              <span className="mg-btn-num">{i + 1}</span>
              <span className="mg-btn-text">
                {isClicked
                  ? (isCorrect ? "✅ " : "❌ ")
                  : isActive
                  ? "🔊 "
                  : "👉 "}
                {step.text}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}