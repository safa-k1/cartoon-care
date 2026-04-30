import { useState } from "react";
import "./MiniGame.css";

const miniGames = {
  asthma: {
    title: "Help Maya use her inhaler! 💨",
    steps: [
      { text: "Shake the inhaler", correct: true },
      { text: "Press and breathe in", correct: true },
      { text: "Hold your breath for 10 seconds", correct: true },
    ],
    successMessage: "Great job! Maya can breathe easily again 🌬️",
  },
  fever: {
    title: "Help Lily cool down! 🌡️",
    steps: [
      { text: "Drink water", correct: true },
      { text: "Rest under a light blanket", correct: true },
      { text: "Run around a lot", correct: false },
    ],
    successMessage: "Nice! Lily is feeling better now 🌡️",
  },
  vomiting: {
    title: "Help Ethan feel better! 🍵",
    steps: [
      { text: "Take small sips of water", correct: true },
      { text: "Rest in bed", correct: true },
      { text: "Eat a big heavy meal", correct: false },
    ],
    successMessage: "Good choice! Ethan's tummy is recovering 🍵",
  },
  allergy: {
    title: "Stop Zoe's sneezing! 🌸",
    steps: [
      { text: "Wear sunglasses outside", correct: true },
      { text: "Take allergy medicine", correct: true },
      { text: "Roll in flowers", correct: false },
    ],
    successMessage: "Perfect! Zoe can enjoy spring again 🌸",
  },
  flu: {
    title: "Help Jake fight the flu! 🦠",
    steps: [
      { text: "Drink lots of water", correct: true },
      { text: "Get plenty of rest", correct: true },
      { text: "Go to school anyway", correct: false },
    ],
    successMessage: "Awesome! Jake is on the mend 💪",
  },
  cough: {
    title: "Help Carlos soothe his cough! 🍵",
    steps: [
      { text: "Drink warm honey tea", correct: true },
      { text: "Sleep with an extra pillow", correct: true },
      { text: "Yell as loud as possible", correct: false },
    ],
    successMessage: "Well done! Carlos feels much better 😊",
  },
  headache: {
    title: "Help Mia beat her headache! 💧",
    steps: [
      { text: "Drink a big glass of water", correct: true },
      { text: "Rest in a quiet dark room", correct: true },
      { text: "Stare at a bright screen", correct: false },
    ],
    successMessage: "Perfect! Mia's headache is gone 🌟",
  },
  earache: {
    title: "Help Sam's ear feel better! 🎵",
    steps: [
      { text: "Take your antibiotic medicine", correct: true },
      { text: "Hold a warm cloth on your ear", correct: true },
      { text: "Poke inside your ear", correct: false },
    ],
    successMessage: "Great! Sam is back at the piano 🎹",
  },
  acne: {
    title: "Help Alex care for her skin! ✨",
    steps: [
      { text: "Wash face gently twice a day", correct: true },
      { text: "Apply the cream at night", correct: true },
      { text: "Squeeze the pimples hard", correct: false },
    ],
    successMessage: "Amazing! Alex feels confident and great 😊",
  },
};

export default function MiniGame({ condition }) {
  const game = miniGames[condition?.toLowerCase()];
  const [clicked, setClicked] = useState([]);
  const [done, setDone] = useState(false);

  if (!game) return null;

  function handleClick(index, correct) {
    if (clicked.includes(index)) return;

    const newClicked = [...clicked, index];
    setClicked(newClicked);

    // Count how many correct answers have been clicked
    const correctCount = newClicked.filter(
      (i) => game.steps[i].correct
    ).length;

    const totalCorrect = game.steps.filter((s) => s.correct).length;

    if (correctCount >= totalCorrect) {
      setTimeout(() => setDone(true), 600);
    }
  }

  function handleReset() {
    setClicked([]);
    setDone(false);
  }

  return (
    <div className="minigame">
      <h3 className="minigame-title">{game.title}</h3>

      {!done ? (
        <>
          <p className="minigame-hint">Tap all the right choices!</p>
          <div className="minigame-steps">
            {game.steps.map((step, i) => {
              const isClicked = clicked.includes(i);
              const isCorrect = step.correct;

              return (
                <button
                  key={i}
                  className={`minigame-btn ${
                    isClicked
                      ? isCorrect
                        ? "minigame-btn--correct"
                        : "minigame-btn--wrong"
                      : ""
                  }`}
                  onClick={() => handleClick(i, step.correct)}
                  disabled={isClicked}
                >
                  {isClicked ? (isCorrect ? "✅ " : "❌ ") : "👉 "}
                  {step.text}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div className="minigame-success">
          <span className="minigame-trophy">🏆</span>
          <p className="minigame-success-text">{game.successMessage}</p>
          <button className="minigame-reset" onClick={handleReset}>
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}