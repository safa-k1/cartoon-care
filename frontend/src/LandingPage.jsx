import { useState } from "react";
import { BEAR_IMGS } from "./App.jsx";

const API_URL = "http://localhost:3001";
const ELEVENLABS_VOICE_ID = "EXAVITQu4vr4xnSDxMaL";
const ELEVENLABS_API_KEY  = import.meta.env.VITE_ELEVENLABS_API_KEY;

async function fetchStory({ name, age, condition }) {
  const res = await fetch(`${API_URL}/api/story`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, age, condition }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Story fetch failed");
  return data.story;
}

import pinkBearImg   from "./assets/bears/pinkBear.png";
import blueBearImg   from "./assets/bears/blueBear.png";
import greenBearImg  from "./assets/bears/greenBear.png";
import orangeBearImg from "./assets/bears/orangeBear.png";
import purpleBearImg from "./assets/bears/purpleBear.png";

import asthmaIcon   from "./assets/icons/asthma.png";
import allergyIcon  from "./assets/icons/allergy.png";
import feverIcon    from "./assets/icons/fever.png";
import vomitingIcon from "./assets/icons/vomiting.png";
import fluIcon      from "./assets/icons/flu.png";
import coughIcon    from "./assets/icons/cough.png";
import headacheIcon from "./assets/icons/headache.png";
import earacheIcon  from "./assets/icons/earache.png";
import acneIcon     from "./assets/icons/acne.png";

const BEARS = [
  { color: "#e879a0", name: "Pink Bear 🩷",   bg: "rgba(232,121,160,0.15)", img: pinkBearImg   },
  { color: "#3b82f6", name: "Blue Bear 💙",   bg: "rgba(59,130,246,0.15)",  img: blueBearImg   },
  { color: "#10b981", name: "Green Bear 💚",  bg: "rgba(16,185,129,0.15)",  img: greenBearImg  },
  { color: "#f97316", name: "Orange Bear 🧡", bg: "rgba(249,115,22,0.15)",  img: orangeBearImg },
  { color: "#a855f7", name: "Purple Bear 💜", bg: "rgba(168,85,247,0.15)",  img: purpleBearImg },
];

const CONDITIONS = [
  { name: "Asthma",   icon: asthmaIcon,   bg: "#fce4f3", border: "#f9a8d4", text: "#9d174d",  speak: "Asthma! It can make breathing feel tricky, but your inhaler is your superpower!" },
  { name: "Allergy",  icon: allergyIcon,  bg: "#ede9fe", border: "#c4b5fd", text: "#5b21b6",  speak: "Allergy! Sometimes your body reacts to things like pollen or pets. Your medicine helps!" },
  { name: "Fever",    icon: feverIcon,    bg: "#ffedd5", border: "#fed7aa", text: "#9a3412",  speak: "Fever! When your body heats up to fight germs. Rest and water help you feel better!" },
  { name: "Vomiting", icon: vomitingIcon, bg: "#d1fae5", border: "#6ee7b7", text: "#065f46",  speak: "Vomiting. Your tummy is protecting you. Small sips of water help a lot!" },
  { name: "Flu",      icon: fluIcon,      bg: "#dbeafe", border: "#93c5fd", text: "#1e3a8a",  speak: "Flu! A virus that makes you feel achy and tired. Rest helps your body fight back!" },
  { name: "Cough",    icon: coughIcon,    bg: "#fef9c3", border: "#fde68a", text: "#713f12",  speak: "Cough! Your lungs clearing the way. Warm honey tea helps so much!" },
  { name: "Headache", icon: headacheIcon, bg: "#fce7f3", border: "#f9a8d4", text: "#831843",  speak: "Headache! Your head asking for water and rest. Drink up!" },
  { name: "Earache",  icon: earacheIcon,  bg: "#e0e7ff", border: "#a5b4fc", text: "#312e81",  speak: "Earache! A deep pain inside your ear. Medicine from the doctor helps it heal!" },
  { name: "Acne",     icon: acneIcon,     bg: "#f3e8ff", border: "#d8b4fe", text: "#581c87",  speak: "Acne! Tiny skin bumps that are super normal when you are growing up!" },
];

export default function LandingPage({ onStart, name, setName, bearImgIndex, setBearImgIndex }) {
  const [age, setAge]             = useState("");
  const [condition, setCondition] = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  // Derive selectedBear from bearImgIndex so it also persists across nav
  const selectedBear = BEARS[bearImgIndex] ?? BEARS[0];
  const setSelectedBear = (bear) => setBearImgIndex(BEARS.indexOf(bear));

  const btnGradient = `linear-gradient(135deg, ${selectedBear.color}, #a855f7)`;

  // FIX 3: ElevenLabs "Say it!" — falls back to browser TTS on failure
  async function handleSayIt(e, speak) {
    e.stopPropagation();
    window.speechSynthesis.cancel();
    try {
      const res = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
        {
          method: "POST",
          headers: {
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: speak,
            model_id: "eleven_multilingual_v2",
            voice_settings: { stability: 0.75, similarity_boost: 0.85 },
          }),
        }
      );
      if (!res.ok) throw new Error("ElevenLabs failed");
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => URL.revokeObjectURL(url);
      audio.play();
    } catch {
      // Fallback to browser TTS
      const u = new SpeechSynthesisUtterance(speak);
      u.rate = 0.85; u.pitch = 1.25;
      window.speechSynthesis.speak(u);
    }
  }

  async function handleSubmit() {
    setError("");
    if (!name.trim() || !age || !condition.trim()) {
      setError("Please fill in all fields! 🌟");
      return;
    }
    setLoading(true);
    try {
      const story = await fetchStory({ name: name.trim(), age, condition: condition.trim() });
      onStart({ name: name.trim(), age, condition: condition.trim() }, story, bearImgIndex);
    } catch {
      setError("Couldn't reach server.");
    } finally {
      setLoading(false);
    }
  }

  // FIX 2: explore cards no longer need a name — use "Friend" as fallback
  async function handleConditionClick(cond) {
    setCondition(cond.name.toLowerCase());
    setLoading(true);
    setError("");
    try {
      const displayName = name.trim() || "Friend";
      const displayAge  = age || 8;
      const story = await fetchStory({
        name: displayName,
        age:  displayAge,
        condition: cond.name.toLowerCase(),
      });
      onStart(
        { name: displayName, age: displayAge, condition: cond.name.toLowerCase() },
        story,
        bearImgIndex,
      );
    } catch {
      setError("Couldn't load story. Is the backend running on port 3001?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="cc">
      <div className="rainbow" />

      {/* Decorative clouds */}
      <div style={{position:"absolute",top:80,left:-20,width:80,height:30,background:"white",borderRadius:40,opacity:0.6,zIndex:1,pointerEvents:"none"}} />
      <div style={{position:"absolute",top:60,left:-10,width:50,height:50,background:"white",borderRadius:"50%",opacity:0.6,zIndex:1,pointerEvents:"none"}} />
      <div style={{position:"absolute",top:70,left:30,width:60,height:60,background:"white",borderRadius:"50%",opacity:0.6,zIndex:1,pointerEvents:"none"}} />

      {/* Nav */}
      <div className="cc-nav">
        <div className="cc-logo">
          <img src={selectedBear.img} alt="Care Bear" style={{ width: 28, height: 28, objectFit: "contain", verticalAlign: "middle" }} />
          {" "}CartoonCare
        </div>
        <div className="cc-badge">✨ AI STORYBOOK</div>
      </div>

      {/* Hero */}
      <div className="cc-hero">
        <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:10}}>
          {["🌈","☁️","⭐","☁️","🌈"].map((e,i) => (
            <span key={i} style={{fontSize:28,animation:"cfloat 3s ease-in-out infinite",animationDelay:`${i*0.4}s`,display:"inline-block"}}>{e}</span>
          ))}
        </div>
        <div className="cc-title">
          <span style={{background:"linear-gradient(135deg,#e879a0,#a855f7,#3b82f6,#10b981)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
            Cartoon Care ✨
          </span>
        </div>
        {/* Care bears parade under the title */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, margin: "8px 0 4px" }}>
          {BEARS.map((b, i) => (
            <img
              key={b.color}
              src={b.img}
              alt={b.name}
              style={{
                width: 38,
                height: 38,
                objectFit: "contain",
                animation: `cfloat 3s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
        <p className="cc-sub">Where every child is a hero 🌟<br/>Your Care Bear is waiting for you!</p>
      </div>

      {/* ── Bear Builder ── */}
      <div className="bear-section">
        <div className="bear-title">
          <img src={selectedBear.img} alt="" style={{ width: 26, height: 26, objectFit: "contain", verticalAlign: "middle" }} />
          {" "}Build Your Care Bear!
        </div>
        <div className="bear-sub">Pick your colour and tell us your name 👇</div>

        <div className="bear-display">
          <div className="bear-name-tag" style={{color:selectedBear.color, borderColor:selectedBear.color+"44"}}>
            {name || "Your Name"}
          </div>
          <div className="bear-img-wrap" style={{background:selectedBear.bg, borderRadius:"50%"}}>
            <img src={selectedBear.img} alt={selectedBear.name} />
          </div>
          <div className="bear-color-name" style={{color:selectedBear.color}}>
            {selectedBear.name}
          </div>
        </div>

        <div className="color-label">Choose your bear's colour! 🎨</div>
        <div className="color-row">
          {BEARS.map((b, i) => (
            <div
              key={b.color}
              className={`color-swatch${selectedBear.color === b.color ? " active" : ""}`}
              style={{background: b.color}}
              onClick={() => { setSelectedBear(b); setBearImgIndex(i); }}
              title={b.name}
            />
          ))}
        </div>

        <div>
          <span className="cc-label">👋 What is your name?</span>
          <input
            className="cc-input"
            placeholder="Type your name here!"
            maxLength={20}
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
      </div>

      {/* ── Create Story Form ── */}
      <div className="form-section">
        <div className="form-title">
          <img src={selectedBear.img} alt="" style={{ width: 24, height: 24, objectFit: "contain", verticalAlign: "middle" }} />
          {" "}Create Your Story!
        </div>
        <div className="field-row">
          <div>
            <span className="cc-label">🎂 How old are you?</span>
            <select className="cc-input-sm" value={age} onChange={e => setAge(e.target.value)}>
              <option value="">Age</option>
              {[3,4,5,6,7,8,9,10,11,12].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <span className="cc-label">🩺 What's going on?</span>
            <input
              className="cc-input-sm"
              placeholder="e.g. asthma"
              value={condition}
              onChange={e => setCondition(e.target.value)}
            />
          </div>
        </div>
        {error && <p className="form-error-cc">{error}</p>}
        <button className="cc-btn" style={{background: btnGradient}} onClick={handleSubmit} disabled={loading}>
          {loading
            ? <><img src={selectedBear.img} alt="" style={{ width: 20, height: 20, objectFit: "contain", verticalAlign: "middle" }} /> Making Story...</>
            : <><img src={selectedBear.img} alt="" style={{ width: 20, height: 20, objectFit: "contain", verticalAlign: "middle" }} /> Make My Story!</>
          }
        </button>
      </div>

      {/* ── Explore Conditions Grid ── */}
      <div className="explore-section">
        <div
          className="explore-title"
          style={{background:"linear-gradient(135deg,#e879a0,#a855f7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}
        >
          🌍 Explore Different Conditions!
        </div>
        <div className="explore-sub">
          Tap "Say it!" to hear what it is! Click any card to jump straight into that story — no name needed!{" "}
          <img src={selectedBear.img} alt="bear" style={{ width: 18, height: 18, objectFit: "contain", verticalAlign: "middle" }} />
        </div>
        <div className="cond-grid">
          {CONDITIONS.map(c => (
            <div
              key={c.name}
              className="cond-card"
              style={{background: c.bg, borderColor: c.border}}
              onClick={() => handleConditionClick(c)}
            >
              <img src={c.icon} alt={c.name} className="cond-icon-img" />
              <span className="cond-name" style={{color: c.text}}>{c.name}</span>
              {/* FIX 3: ElevenLabs voice on Say it! */}
              <button
                className="say-btn"
                style={{color: c.text, borderColor: c.border}}
                onClick={e => handleSayIt(e, c.speak)}
              >
                <img src={selectedBear.img} alt="" style={{ width: 16, height: 16, objectFit: "contain", verticalAlign: "middle" }} />
                {" "}Say it!
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Clouds row */}
      <div className="clouds-row">
        {["☁️","🌈","⭐","🌈","☁️"].map((e,i) => (
          <span key={i} className="cloud-item" style={{animationDelay:`${i*0.5}s`}}>{e}</span>
        ))}
      </div>

      {/* Footer care bears */}
      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 8 }}>
        {BEARS.map((b, i) => (
          <img
            key={b.color}
            src={b.img}
            alt={b.name}
            style={{ width: 32, height: 32, objectFit: "contain", animation: `cfloat 3s ease-in-out infinite`, animationDelay: `${i * 0.25}s` }}
          />
        ))}
      </div>

      <div className="cc-footer">
        Made by Safa, Inshaal, Wareesha with care 💖
      </div>

      {loading && (
        <div className="loading-bar">
          <div className="loading-bar-fill" />
          <p style={{textAlign:"center",fontFamily:"'Baloo 2',cursive",fontWeight:700,color:"#7c3aed",fontSize:15,paddingBottom:16}}>
            <img src={selectedBear.img} alt="" style={{ width: 20, height: 20, objectFit: "contain", verticalAlign: "middle" }} />
            {" "}Building your story...
          </p>
        </div>
      )}
    </div>
  );
}