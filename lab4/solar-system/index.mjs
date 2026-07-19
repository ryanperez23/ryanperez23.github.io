import express from "express";
import fetch from "node-fetch";

const planets = (await import("npm-solarsystem")).default;

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));

const planetNames = [
  "Mercury",
  "Venus",
  "Earth",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune"
];

const replacementPlanetImages = {
  Mercury:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Mercury_in_true_color.jpg",

  Venus:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Venus-real_color.jpg",

  Earth:
    "https://commons.wikimedia.org/wiki/Special:FilePath/The_Blue_Marble,_AS17-148-22727.png",

  Mars:
    "https://commons.wikimedia.org/wiki/Special:FilePath/OSIRIS_Mars_true_color.jpg",

  Jupiter:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Jupiter_and_its_shrunken_Great_Red_Spot.jpg",

  Saturn:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Saturn_during_Equinox.jpg",

  Uranus:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Uranus2.jpg",

  Neptune:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Neptune_Full.jpg"
};

const backgroundImages = [
  "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa",
  "https://images.unsplash.com/photo-1462331940025-496dfbfc7564",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
  "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a"
];

app.get("/", (req, res) => {
  const randomIndex = Math.floor(
    Math.random() * backgroundImages.length
  );

  const randomImage = backgroundImages[randomIndex];

  res.render("index", {
    image: randomImage,
    planetNames
  });
});

app.get("/planet", (req, res) => {
  const planetName = req.query.planetName;

  if (!planetNames.includes(planetName)) {
    return res.status(404).render("error", {
      message: "The requested planet was not found.",
      planetNames
    });
  }

  const planetFunction = planets[`get${planetName}`];

  if (typeof planetFunction !== "function") {
    return res.status(404).render("error", {
      message: "Planet information is currently unavailable.",
      planetNames
    });
  }

  const planetInfo = planetFunction();

  const planetImage =
    replacementPlanetImages[planetName];

  const currentIndex = planetNames.indexOf(planetName);

  const previousPlanet =
    planetNames[
      (currentIndex - 1 + planetNames.length) %
        planetNames.length
    ];

  const nextPlanet =
    planetNames[
      (currentIndex + 1) % planetNames.length
    ];

  res.render("planet", {
    planetInfo,
    planetImage,
    planetName,
    planetNames,
    previousPlanet,
    nextPlanet
  });
});

app.get("/nasa", async (req, res) => {
  try {
    const apiKey =
      process.env.NASA_API_KEY ||
      "9mUzIkhlZCZaOoMfspg7jMmwZCZ4LiRHtkgkambD";

    const url =
      `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("NASA API request failed.");
    }

    const nasaData = await response.json();

    res.render("nasa", {
      nasaData,
      planetNames
    });
  } catch (error) {
    res.status(500).render("error", {
      message:
        "NASA's Picture of the Day is currently unavailable.",
      planetNames
    });
  }
});

app.use((req, res) => {
  res.status(404).render("error", {
    message: "The requested page was not found.",
    planetNames
  });
});

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});