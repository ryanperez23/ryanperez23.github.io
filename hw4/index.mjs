import express from "express";
import fetch from "node-fetch";
import { faker } from "@faker-js/faker";

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index", {
    currentPage: "overview"
  });
});

app.get("/web-process", (req, res) => {
  res.render("web-process", {
    currentPage: "process"
  });
});

app.get("/web-design", (req, res) => {
  res.render("web-design", {
    currentPage: "design"
  });
});

app.get("/software-engineering", (req, res) => {
  res.render("software-engineering", {
    currentPage: "software"
  });
});

app.get("/resources", async (req, res) => {
  try {
    const apiUrl =
      "https://openlibrary.org/search.json" +
      "?q=software+engineering" +
      "&fields=key,title,author_name,first_publish_year,cover_i" +
      "&limit=6";

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(
        "Unable to retrieve information from Open Library."
      );
    }

    const data = await response.json();

    res.render("resources", {
      currentPage: "resources",
      books: data.docs,
      errorMessage: null
    });
  } catch (error) {
    res.render("resources", {
      currentPage: "resources",
      books: [],
      errorMessage:
        "The learning resources are currently unavailable."
    });
  }
});

app.get("/developer-profile", (req, res) => {
  const developer = {
    name: faker.person.fullName(),
    jobTitle: faker.person.jobTitle(),
    email: faker.internet.email(),
    city: faker.location.city(),
    country: faker.location.country(),
    biography: faker.person.bio()
  };

  res.render("developer-profile", {
    currentPage: "developer",
    developer
  });
});

app.use((req, res) => {
  res.status(404).render("error", {
    currentPage: "",
    message: "The requested page was not found."
  });
});

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});