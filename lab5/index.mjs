import express from "express";
import mysql from "mysql2/promise";

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    connectionLimit: 10,
    waitForConnections: true
});

// Home page
app.get("/", async (req, res) => {
    try {
        const authorQuery = pool.query(`
            SELECT authorId, firstName, lastName
            FROM q_authors
            ORDER BY lastName, firstName
        `);

        const categoryQuery = pool.query(`
            SELECT DISTINCT category
            FROM q_quotes
            ORDER BY category
        `);

        const [authorResult, categoryResult] = await Promise.all([
            authorQuery,
            categoryQuery
        ]);

        const authors = authorResult[0];
        const categories = categoryResult[0];

        res.render("index", {
            authors,
            categories
        });
    } catch (err) {
        console.error("Home page error:", err);
        res.status(500).send("Unable to load the home page");
    }
});

// Database connection test
app.get("/dbTest", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT CURDATE()");
        res.send(rows);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error");
    }
});

// Search quotes by keyword
app.get("/searchByKeyword", async (req, res) => {
    try {
        const keyword = (req.query.keyword ?? "").trim();

        const sql = `
            SELECT
                q_quotes.authorId,
                q_authors.firstName,
                q_authors.lastName,
                q_quotes.quote,
                q_quotes.category,
                q_quotes.likes
            FROM q_quotes
            INNER JOIN q_authors
                ON q_quotes.authorId = q_authors.authorId
            WHERE q_quotes.quote LIKE ?
            ORDER BY q_authors.lastName, q_quotes.quote
        `;

        const [rows] = await pool.query(sql, [`%${keyword}%`]);

        res.render("results", {
            heading: `Quotes containing "${keyword}"`,
            message: null,
            quotes: rows
        });
    } catch (err) {
        console.error("Keyword search error:", err);
        res.status(500).send("Keyword search error");
    }
});

// Search quotes by author
app.get("/searchByAuthor", async (req, res) => {
    try {
        const authorId = req.query.authorId;

        const sql = `
            SELECT
                q_quotes.authorId,
                q_authors.firstName,
                q_authors.lastName,
                q_quotes.quote,
                q_quotes.category,
                q_quotes.likes
            FROM q_quotes
            INNER JOIN q_authors
                ON q_quotes.authorId = q_authors.authorId
            WHERE q_quotes.authorId = ?
            ORDER BY q_quotes.quote
        `;

        const [rows] = await pool.query(sql, [authorId]);

        const authorName =
            rows.length > 0
                ? `${rows[0].firstName} ${rows[0].lastName}`
                : "Selected Author";

        res.render("results", {
            heading: `Quotes by ${authorName}`,
            message: null,
            quotes: rows
        });
    } catch (err) {
        console.error("Author search error:", err);
        res.status(500).send("Author search error");
    }
});

// Search quotes by category
app.get("/searchByCategory", async (req, res) => {
    try {
        const category = req.query.category;

        const sql = `
            SELECT
                q_quotes.authorId,
                q_authors.firstName,
                q_authors.lastName,
                q_quotes.quote,
                q_quotes.category,
                q_quotes.likes
            FROM q_quotes
            INNER JOIN q_authors
                ON q_quotes.authorId = q_authors.authorId
            WHERE q_quotes.category = ?
            ORDER BY q_authors.lastName, q_quotes.quote
        `;

        const [rows] = await pool.query(sql, [category]);

        res.render("results", {
            heading: `${category} Quotes`,
            message: null,
            quotes: rows
        });
    } catch (err) {
        console.error("Category search error:", err);
        res.status(500).send("Category search error");
    }
});

// Search quotes by likes range
app.get("/searchByLikes", async (req, res) => {
    try {
        const minimumLikes = Number(req.query.minimumLikes);
        const maximumLikes = Number(req.query.maximumLikes);

        if (
            !Number.isFinite(minimumLikes) ||
            !Number.isFinite(maximumLikes) ||
            minimumLikes < 0 ||
            maximumLikes < 0 ||
            minimumLikes > maximumLikes
        ) {
            return res.render("results", {
                heading: "Likes Search",
                message: "Enter a valid likes range.",
                quotes: []
            });
        }

        const sql = `
            SELECT
                q_quotes.authorId,
                q_authors.firstName,
                q_authors.lastName,
                q_quotes.quote,
                q_quotes.category,
                q_quotes.likes
            FROM q_quotes
            INNER JOIN q_authors
                ON q_quotes.authorId = q_authors.authorId
            WHERE q_quotes.likes BETWEEN ? AND ?
            ORDER BY q_quotes.likes DESC, q_authors.lastName
        `;

        const [rows] = await pool.query(sql, [
            minimumLikes,
            maximumLikes
        ]);

        res.render("results", {
            heading: `Quotes with ${minimumLikes} to ${maximumLikes} likes`,
            message: null,
            quotes: rows
        });
    } catch (err) {
        console.error("Likes search error:", err);
        res.status(500).send("Likes search error");
    }
});

// Local API for displaying author information
app.get("/api/author/:id", async (req, res) => {
    try {
        const authorId = req.params.id;

        const sql = `
            SELECT *
            FROM q_authors
            WHERE authorId = ?
        `;

        const [rows] = await pool.query(sql, [authorId]);

        if (rows.length === 0) {
            return res.status(404).json({
                error: "Author not found"
            });
        }

        res.send(rows);
    } catch (err) {
        console.error("Author API error:", err);

        res.status(500).json({
            error: "Unable to retrieve author information"
        });
    }
});

// Page not found
app.use((req, res) => {
    res.status(404).send("Page not found");
});

// Start server
app.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
});