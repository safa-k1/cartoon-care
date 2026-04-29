import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load pre-made stories
const __dirname = dirname(fileURLToPath(import.meta.url));
const storiesData = JSON.parse(
  readFileSync(join(__dirname, "demo/stories.json"), "utf-8")
);

export async function generateStory({
  name,
  age,
  condition,
  language = "English",
}) {
  const conditionLower = condition.toLowerCase().trim();

  // 1. PRE-MADE STORIES (instant)
  const premade = storiesData.stories.find(
    (s) => s.condition === conditionLower
  );

  if (premade && language === "English") {
    console.log(`Using pre-made story for: ${condition}`);

    const personalized = JSON.parse(JSON.stringify(premade));
    personalized.pages = personalized.pages.map((page) => ({
      ...page,
      text: page.text.replace(
        new RegExp(premade.character, "g"),
        name
      ),
    }));

    personalized.character = name;
    return personalized;
  }

  // 2. FALLBACK STORY (for anything not in dataset)
  console.log(`Using fallback story for: ${condition}`);

  return {
    title: `${name}'s Adventure`,
    character: name,
    pages: [
      {
        pageNumber: 1,
        text: `${name} is learning about ${condition}. Their body is doing its best to help them feel better.`,
        imagePrompt:
          "warm children's book illustration of a happy child, soft watercolor style",
        emotion: "calm",
      },
      {
        pageNumber: 2,
        text: `With help from family and doctors, ${name} feels safe and cared for.`,
        imagePrompt:
          "child with caring doctor and parent in warm clinic, watercolor illustration",
        emotion: "hopeful",
      },
      {
        pageNumber: 3,
        text: `${name} is strong, brave, and getting better every day.`,
        imagePrompt:
          "happy confident child standing in sunlight, uplifting illustration",
        emotion: "happy",
      },
    ],
  };
}