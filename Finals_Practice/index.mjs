import express from "express";
import mysql from "mysql2/promise";

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const pool = mysql.createPool(process.env.JAWSDB_URL);

// Home Page
app.get("/", async (req, res) => {
    try {
        const [sites] = await pool.query(
            "SELECT * FROM fe_comic_sites"
        );

        const [randomComic] = await pool.query(`
            SELECT fe_comics.*, fe_comic_sites.comicSiteName
            FROM fe_comics
            JOIN fe_comic_sites
            ON fe_comics.comicSiteId = fe_comic_sites.comicSiteId
            ORDER BY RAND()
            LIMIT 1
        `);

        res.render("index", {
            sites,
            randomComic: randomComic[0]
        });

    } catch (error) {
        console.log(error);
        res.status(500).send("Database Error");
    }
});

// Web API - Random Comic
app.get("/api/randomComic", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT fe_comics.*, fe_comic_sites.comicSiteName
            FROM fe_comics
            JOIN fe_comic_sites
            ON fe_comics.comicSiteId = fe_comic_sites.comicSiteId
            ORDER BY RAND()
            LIMIT 1
        `);

        res.json(rows[0]);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Database Error" });
    }
});

// Add Comic Page
app.get("/addComic", async (req, res) => {
    try {
        const [sites] = await pool.query(
            "SELECT * FROM fe_comic_sites"
        );

        res.render("addComic", { sites });

    } catch (error) {
        console.log(error);
        res.status(500).send("Database Error");
    }
});

// Add New Comic
app.post("/addComic", async (req, res) => {
    try {
        const {
            comicTitle,
            comicUrl,
            comicDate,
            comicSiteId
        } = req.body;

        await pool.query(
            `INSERT INTO fe_comics
            (comicTitle, comicUrl, comicDate, comicSiteId)
            VALUES (?, ?, ?, ?)`,
            [comicTitle, comicUrl, comicDate, comicSiteId]
        );

        res.redirect("/");

    } catch (error) {
        console.log(error);
        res.status(500).send("Database Error");
    }
});

// Comic Page
app.get("/comicPage/:siteId", async (req, res) => {
    try {
        const siteId = req.params.siteId;

        const [sites] = await pool.query(
            "SELECT * FROM fe_comic_sites WHERE comicSiteId = ?",
            [siteId]
        );

        const [comics] = await pool.query(
            "SELECT * FROM fe_comics WHERE comicSiteId = ?",
            [siteId]
        );

        res.render("comicPage", {
            site: sites[0],
            comics
        });

    } catch (error) {
        console.log(error);
        res.status(500).send("Database Error");
    }
});

// Web API - Comments
app.get("/api/comments/:comicId", async (req, res) => {
    try {
        const [comments] = await pool.query(
            "SELECT * FROM fe_comments WHERE comicId = ?",
            [req.params.comicId]
        );

        res.json(comments);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Database Error" });
    }
});

// Add Comment Page
app.get("/addComment/:comicId", async (req, res) => {
    try {
        const [comics] = await pool.query(
            "SELECT * FROM fe_comics WHERE comicId = ?",
            [req.params.comicId]
        );

        res.render("addComment", {
            comic: comics[0]
        });

    } catch (error) {
        console.log(error);
        res.status(500).send("Database Error");
    }
});

// Submit Comment
app.post("/addComment/:comicId", async (req, res) => {
    try {
        const comicId = req.params.comicId;
        const { author, email, comment } = req.body;

        await pool.query(
            `INSERT INTO fe_comments
            (author, email, comment, comicId)
            VALUES (?, ?, ?, ?)`,
            [author, email, comment, comicId]
        );

        const [comics] = await pool.query(
            "SELECT comicSiteId FROM fe_comics WHERE comicId = ?",
            [comicId]
        );

        res.redirect(`/comicPage/${comics[0].comicSiteId}`);

    } catch (error) {
        console.log(error);
        res.status(500).send("Database Error");
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});