import express from "express";
import mysql from "mysql2/promise";

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const pool = mysql.createPool({
    host: "s554ongw9quh1xjs.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    port: 3306,
    user: "vj6haoxem92fom7k",
    password: "esqbwfic6xszyedu",
    database: "r3ds56u6a8sbhocq",
    connectionLimit: 10,
    waitForConnections: true
});

async function getAuthorsAndCategories() {
    const authorSql = `
        SELECT authorId, firstName, lastName
        FROM q_authors
        ORDER BY lastName, firstName
    `;

    const categorySql = `
        SELECT DISTINCT category
        FROM q_quotes
        WHERE category IS NOT NULL
          AND category <> ''
        ORDER BY category
    `;

    const [authorResult, categoryResult] = await Promise.all([
        pool.query(authorSql),
        pool.query(categorySql)
    ]);

    return {
        authors: authorResult[0],
        categories: categoryResult[0]
    };
}

// Home page
app.get("/", (req, res) => {
    res.render("index");
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

// =====================================================
// AUTHOR ROUTES
// =====================================================

// Display the Add Author form
app.get("/author/new", (req, res) => {
    res.render("newAuthor", {
        message: req.query.message || ""
    });
});

// Add a new author
app.post("/author/new", async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            dob,
            dod,
            sex,
            profession,
            country,
            portrait,
            biography
        } = req.body;

        const sql = `
            INSERT INTO q_authors
            (
                firstName,
                lastName,
                dob,
                dod,
                sex,
                profession,
                country,
                portrait,
                biography
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            firstName,
            lastName,
            dob,
            dod || null,
            sex,
            profession,
            country,
            portrait,
            biography
        ];

        await pool.query(sql, params);

        res.redirect(
            `/author/new?message=${encodeURIComponent(
                "Author added successfully!"
            )}`
        );
    } catch (err) {
        console.error("Add author error:", err);
        res.status(500).send("Unable to add author");
    }
});

// Display all authors
app.get("/authors", async (req, res) => {
    try {
        const sql = `
            SELECT *
            FROM q_authors
            ORDER BY lastName, firstName
        `;

        const [rows] = await pool.query(sql);

        res.render("authorList", {
            authors: rows
        });
    } catch (err) {
        console.error("Author list error:", err);
        res.status(500).send("Unable to load authors");
    }
});

// Display the Edit Author form
app.get("/author/edit", async (req, res) => {
    try {
        const authorId = req.query.authorId;

        const sql = `
            SELECT
                *,
                DATE_FORMAT(dob, '%Y-%m-%d') AS dobISO,
                DATE_FORMAT(dod, '%Y-%m-%d') AS dodISO
            FROM q_authors
            WHERE authorId = ?
        `;

        const [rows] = await pool.query(sql, [authorId]);

        if (rows.length === 0) {
            return res.status(404).send("Author not found");
        }

        res.render("editAuthor", {
            author: rows[0]
        });
    } catch (err) {
        console.error("Load author error:", err);
        res.status(500).send("Unable to load author");
    }
});

// Update an author
app.post("/author/edit", async (req, res) => {
    try {
        const {
            authorId,
            firstName,
            lastName,
            dob,
            dod,
            sex,
            profession,
            country,
            portrait,
            biography
        } = req.body;

        const sql = `
            UPDATE q_authors
            SET
                firstName = ?,
                lastName = ?,
                dob = ?,
                dod = ?,
                sex = ?,
                profession = ?,
                country = ?,
                portrait = ?,
                biography = ?
            WHERE authorId = ?
        `;

        const params = [
            firstName,
            lastName,
            dob,
            dod || null,
            sex,
            profession,
            country,
            portrait,
            biography,
            authorId
        ];

        await pool.query(sql, params);

        res.redirect("/authors");
    } catch (err) {
        console.error("Update author error:", err);
        res.status(500).send("Unable to update author");
    }
});

// Delete an author
app.get("/author/delete", async (req, res) => {
    try {
        const authorId = req.query.authorId;

        const sql = `
            DELETE FROM q_authors
            WHERE authorId = ?
        `;

        await pool.query(sql, [authorId]);

        res.redirect("/authors");
    } catch (err) {
        console.error("Delete author error:", err);
        res.status(500).send("Unable to delete author");
    }
});

// =====================================================
// QUOTE ROUTES
// =====================================================

// Display the Add Quote form
app.get("/quote/new", async (req, res) => {
    try {
        const { authors, categories } =
            await getAuthorsAndCategories();

        res.render("newQuote", {
            authors,
            categories,
            message: req.query.message || ""
        });
    } catch (err) {
        console.error("Load quote form error:", err);
        res.status(500).send("Unable to load quote form");
    }
});

// Add a new quote
app.post("/quote/new", async (req, res) => {
    try {
        const {
            quote,
            authorId,
            category,
            likes
        } = req.body;

        const sql = `
            INSERT INTO q_quotes
            (
                quote,
                authorId,
                category,
                likes
            )
            VALUES (?, ?, ?, ?)
        `;

        const params = [
            quote,
            authorId,
            category,
            Number(likes) || 0
        ];

        await pool.query(sql, params);

        res.redirect(
            `/quote/new?message=${encodeURIComponent(
                "Quote added successfully!"
            )}`
        );
    } catch (err) {
        console.error("Add quote error:", err);
        res.status(500).send("Unable to add quote");
    }
});

// Display all quotes
app.get("/quotes", async (req, res) => {
    try {
        const sql = `
            SELECT
                q.quoteId,
                q.quote,
                q.authorId,
                q.category,
                q.likes,
                a.firstName,
                a.lastName
            FROM q_quotes q
            LEFT JOIN q_authors a
                ON q.authorId = a.authorId
            ORDER BY q.quoteId
        `;

        const [rows] = await pool.query(sql);

        res.render("quoteList", {
            quotes: rows
        });
    } catch (err) {
        console.error("Quote list error:", err);
        res.status(500).send("Unable to load quotes");
    }
});

// Display the Edit Quote form
app.get("/quote/edit", async (req, res) => {
    try {
        const quoteId = req.query.quoteId;

        const quoteSql = `
            SELECT *
            FROM q_quotes
            WHERE quoteId = ?
        `;

        const [quoteResult, formData] = await Promise.all([
            pool.query(quoteSql, [quoteId]),
            getAuthorsAndCategories()
        ]);

        const quotes = quoteResult[0];

        if (quotes.length === 0) {
            return res.status(404).send("Quote not found");
        }

        res.render("editQuote", {
            quoteInfo: quotes[0],
            authors: formData.authors,
            categories: formData.categories
        });
    } catch (err) {
        console.error("Load quote error:", err);
        res.status(500).send("Unable to load quote");
    }
});

// Update a quote
app.post("/quote/edit", async (req, res) => {
    try {
        const {
            quoteId,
            quote,
            authorId,
            category,
            likes
        } = req.body;

        const sql = `
            UPDATE q_quotes
            SET
                quote = ?,
                authorId = ?,
                category = ?,
                likes = ?
            WHERE quoteId = ?
        `;

        const params = [
            quote,
            authorId,
            category,
            Number(likes) || 0,
            quoteId
        ];

        await pool.query(sql, params);

        res.redirect("/quotes");
    } catch (err) {
        console.error("Update quote error:", err);
        res.status(500).send("Unable to update quote");
    }
});

// Delete a quote
app.get("/quote/delete", async (req, res) => {
    try {
        const quoteId = req.query.quoteId;

        const sql = `
            DELETE FROM q_quotes
            WHERE quoteId = ?
        `;

        await pool.query(sql, [quoteId]);

        res.redirect("/quotes");
    } catch (err) {
        console.error("Delete quote error:", err);
        res.status(500).send("Unable to delete quote");
    }
});

// Page not found
app.use((req, res) => {
    res.status(404).send("Page not found");
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on port ${PORT}`);
});