import React, { useState } from "react";

const miniGames = {
  asthma: {
    title: "Help Maya use her inhaler!",
    steps: [
      { text: "Shake the inhaler", correct: true },
      { text: "Press and breathe in", correct: true },
      { text: "Hold your breath for 10 seconds", correct: true }
    ],
    successMessage: "Great job! Maya can breathe easily again 🌬️"
  },

  fever: {
    title: "Help Lily cool down!",
    steps: [
      { text: "Drink water", correct: true },
      { text: "Rest under a light blanket", correct: true },
      { text: "Run around a lot", correct: false }
    ],
    successMessage: "Nice! Lily is feeling better now 🌡️"
  },

  vomiting: {
    title: "Help Ethan feel better!",
    steps: [
      { text: "Take small sips of water", correct: true },
      { text: "Rest in bed", correct: true },
      { text: "Eat a big heavy meal", correct: false }
    ],
    successMessage: "Good choice! Ethan’s tummy is recovering 🍵"
  },

  allergy: {
    title: "Stop Zoe’s sneezing!",
    steps: [
      { text: "Wear sunglasses outside", correct: true },
      { text: "Take allergy medicine", correct: true },
      { text: "Roll in flowers", correct: false }
    ],
    successMessage: "Perfect! Zoe can enjoy spring again 🌸"
  }
};

export default function MiniGame({ condition }) {
  const game = miniGames[condition];
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);

  if (!game) return null;

  const handleClick = (correct) => {
    if (correct) setScore(score + 1);

    if (score + 1 >= 2) {
      setDone(true);
    }
  };

  return (
    <div style={{ padding: "20px", border: "2px solid #ccc", marginTop: "20px" }}>
      <h2>{game.title}</h2>

      {!done ? (
        game.steps.map((step, i) => (
          <button
            key={i}
            onClick={() => handleClick(step.correct)}
            style={{ display: "block", margin: "10px 0" }}
          >
            {step.text}
          </button>
        ))
      ) : (
        <h3>{game.successMessage}</h3>
      )}
    </div>
  );
}