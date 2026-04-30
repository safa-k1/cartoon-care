import { useState, useRef } from "react";
import "./App.css";
import LandingPage from "./LandingPage.jsx";
import MiniGame from "./MiniGame.jsx";

const API_URL = "http://localhost:3001";

const EMOTION_BG = {
  happy:     "#d4f5e9",
  calm:      "#e8f4fd",
  curious:   "#ede0ff",
  brave:     "#ffe5d0",
  hopeful:   "#ffd6e0",
  nervous:   "#ede0ff",
  surprised: "#ffd6e0",
  proud:     "#d4f5e9",
};

const EMOTION_EMOJI = {
  happy: "😊", calm: "😌", brave: "💪",
  hopeful: "🌟", curious: "🤔", nervous: "😬",
  surprised: "😮", proud: "🦁",
};

const ALL_IMAGES = {
  asthma:   import.meta.glob("./assets/asthma/*",   { eager: true }),
  allergy:  import.meta.glob("./assets/allergy/*",  { eager: true }),
  vomiting: import.meta.glob("./assets/vomiting/*", { eager: true }),
  fever:    import.meta.glob("./assets/fever/*",    { eager: true }),
  flu:      import.meta.glob("./assets/flu/*",      { eager: true }),
  cough:    import.meta.glob("./assets/cough/*",    { eager: true }),
  headache: import.meta.glob("./assets/headache/*", { eager: true }),
  earache:  import.meta.glob("./assets/earache/*",  { eager: true }),
  acne:     import.meta.glob("./assets/acne/*",     { eager: true }),
};

import pinkBearImg   from "./assets/bears/pinkBear.png";
import blueBearImg   from "./assets/bears/blueBear.png";
import greenBearImg  from "./assets/bears/greenBear.png";
import orangeBearImg from "./assets/bears/orangeBear.png";
import purpleBearImg from "./assets/bears/purpleBear.png";

// Exported so LandingPage can import the same array
export const BEAR_IMGS = [pinkBearImg, blueBearImg, greenBearImg, orangeBearImg, purpleBearImg];

function getPageImage(condition, pageNumber) {
  const folder = ALL_IMAGES[condition?.toLowerCase()];
  if (!folder) return null;
  const files = Object.entries(folder).sort(([a], [b]) => a.localeCompare(b));
  const entry = files[pageNumber - 1];
  return entry ? entry[1].default : null;
}

async function fetchAudio(text) {
  const res = await fetch(`${API_URL}/api/audio`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("Audio failed");
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

function StorybookPage({ story, childInfo, onGoBack, bearImgIndex }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [audioState, setAudioState]     = useState("idle");
  const [showGame, setShowGame]         = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const audioRef = useRef(null);

  const pages   = story.pages;
  const page    = pages[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast  = currentIndex === pages.length - 1;

  const bgColor   = EMOTION_BG[page.emotion] || "#e8f4fd";
  const emotionEm = EMOTION_EMOJI[page.emotion] || "📖";
  const image     = getPageImage(childInfo.condition, currentIndex + 1);
  const bearImg   = BEAR_IMGS[bearImgIndex ?? 0];

  function stopAudio() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    window.speechSynthesis.cancel();
    setAudioState("idle");
  }

  function goTo(i) {
    stopAudio();
    setCurrentIndex(i);
    setShowGame(false);
  }

  function handleLast() {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  }

  async function handleAudio() {
    if (audioState === "playing") { stopAudio(); return; }
    setAudioState("loading");
    try {
      const url = await fetchAudio(page.text);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setAudioState("idle");
      audio.onerror = () => setAudioState("idle");
      await audio.play();
      setAudioState("playing");
    } catch {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(page.text);
      u.rate = 0.9; u.pitch = 1.1;
      u.onend = () => setAudioState("idle");
      window.speechSynthesis.speak(u);
      setAudioState("playing");
    }
  }

  const progress = ((currentIndex + 1) / pages.length) * 100;

  return (
    <div className="storybook">
      {showConfetti && (
        <div className="confetti-container">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="confetti-piece" style={{
              left: `${Math.random() * 100}%`,
              background: ["#e879a0","#a855f7","#3b82f6","#10b981","#f97316","#fbbf24"][i % 6],
              animationDelay: `${Math.random() * 0.5}s`,
              animationDuration: `${1 + Math.random()}s`,
            }} />
          ))}
        </div>
      )}

      <div className="storybook-topbar">
        <button className="back-btn" onClick={onGoBack}>← Home</button>
        <div className="topbar-logo">
          <img src={bearImg} alt="Care Bear" style={{ width: 30, height: 30, objectFit: "contain", verticalAlign: "middle" }} />
          {" "}Cartoon Care ✨
        </div>
        <div className="topbar-child">
          <img src={bearImg} alt="your care bear" style={{ width: 26, height: 26, objectFit: "contain" }} />
          <span>{childInfo.name}</span>
        </div>
      </div>

      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="storybook-inner">
        <div className="viewer-header">
          <div>
            <div className="viewer-story-title">{story.title}</div>
            <div className="viewer-for">
              for {childInfo.name}{" "}
              <img src={bearImg} alt="bear" style={{ width: 18, height: 18, objectFit: "contain", verticalAlign: "middle" }} />
            </div>
          </div>
          <span className="viewer-count">{currentIndex + 1} / {pages.length}</span>
        </div>

        <div className="emotion-badge" style={{ background: bgColor }}>
          <span>{emotionEm}</span>
          <span style={{ textTransform: "capitalize", fontWeight: 700 }}>{page.emotion}</span>
        </div>

        <div key={currentIndex} className="story-page">
          <div className="story-illustration" style={{ background: bgColor }}>
            {image ? (
              <img src={image} alt={`Story page ${page.pageNumber}`} className="story-image" />
            ) : (
              <div className="illustration-placeholder">
                <img
                  src={bearImg}
                  alt="Care Bear"
                  style={{ width: 90, height: 90, objectFit: "contain", animation: "float 3s ease-in-out infinite" }}
                />
                <span className="illustration-label">Page {page.pageNumber}</span>
                <span className="illustration-sub">(add images to src/assets/{childInfo.condition}/)</span>
              </div>
            )}
          </div>
          <div className="story-text-block">
            <p className="story-text">{page.text}</p>
          </div>
          <div className="page-dots">
            {pages.map((_, i) => (
              <span
                key={i}
                className={`page-dot ${i === currentIndex ? "page-dot--active" : ""}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        </div>

        <div className="viewer-controls">
          <button className="ctrl-btn ctrl-btn--nav" onClick={() => goTo(currentIndex - 1)} disabled={isFirst}>
            ← Back
          </button>
          <button
            className={`ctrl-btn ctrl-btn--audio ${audioState === "playing" ? "ctrl-btn--audio-playing" : ""}`}
            onClick={handleAudio}
            disabled={audioState === "loading"}
          >
            {audioState === "loading" ? "⏳ Loading..." :
             audioState === "playing" ? "⏹ Stop" :
             "🔊 Read"}
          </button>
          <button
            className="ctrl-btn ctrl-btn--nav ctrl-btn--next"
            onClick={() => { if (isLast) handleLast(); goTo(Math.min(currentIndex + 1, pages.length - 1)); }}
            disabled={isLast && showGame}
          >
            {isLast ? "🎉 Finish" : "Next →"}
          </button>
        </div>

        {isLast && (
          <div className="viewer-end-card">
            <img
              src={bearImg}
              alt="Care Bear celebrating"
              style={{ width: 100, height: 100, objectFit: "contain", animation: "float 2s ease-in-out infinite", display: "block", margin: "0 auto 8px" }}
            />
            <p className="end-title">The End!</p>
            <p className="end-sub">You're so brave, {childInfo.name}! 🌟</p>
            <div className="end-actions">
              <button className="btn-primary" onClick={() => setShowGame(v => !v)}>
                {showGame ? "📖 Back to Story" : "🎮 Play Mini Game!"}
              </button>
              <button className="btn-secondary" onClick={() => goTo(0)}>
                🔄 Read Again
              </button>
            </div>
          </div>
        )}

        {showGame && isLast && <MiniGame condition={childInfo.condition} />}
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView]                 = useState("landing");
  const [story, setStory]               = useState(null);
  const [childInfo, setChildInfo]       = useState(null);
  const [name, setName]                 = useState("");   // FIX 1: lifted up
  const [bearImgIndex, setBearImgIndex] = useState(0);   // lifted up

  function handleStart(info, storyData, bearIdx) {
    setChildInfo(info);
    setStory(storyData);
    setBearImgIndex(bearIdx ?? 0);
    setView("story");
    window.scrollTo(0, 0);
  }

  function handleGoBack() {
    setView("landing");
    setStory(null);
    // name + bearImgIndex NOT reset — child keeps their bear and name!
  }

  return (
    <div className="app">
      {view === "landing" && (
        <LandingPage
          onStart={handleStart}
          name={name}
          setName={setName}
          bearImgIndex={bearImgIndex}
          setBearImgIndex={setBearImgIndex}
        />
      )}
      {view === "story" && (
        <StorybookPage
          story={story}
          childInfo={childInfo}
          onGoBack={handleGoBack}
          bearImgIndex={bearImgIndex}
        />
      )}
    </div>
  );
}