import express from "express";
import mysql from "mysql2/promise";

const app = express();

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const conn = mysql.createPool({
    host: "wp433upk59nnhpoh.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "zhaoe4dis1zc86re",
    password: "grkzl7yk8z71bjbf",
    database: "ymm1irusykd291j5",
    port: 3306
});


// home page
app.get("/", async (req, res) => {

    let sitesSql = `
        SELECT *
        FROM fe_comic_sites
        ORDER BY comicSiteName
    `;

    let randomSql = `
        SELECT fe_comics.*,
               fe_comic_sites.comicSiteName
        FROM fe_comics
        JOIN fe_comic_sites
        ON fe_comics.comicSiteId = fe_comic_sites.comicSiteId
        ORDER BY RAND()
        LIMIT 1
    `;

    let [sites] = await conn.query(sitesSql);

    let [randomRows] = await conn.query(randomSql);

    res.render("index", {
        sites: sites,
        randomComic: randomRows[0]
    });

});

// randomize the comic API
app.get("/api/randomComic", async (req, res) => {

    let sql = `
        SELECT fe_comics.*,
               fe_comic_sites.comicSiteName
        FROM fe_comics
        JOIN fe_comic_sites
        ON fe_comics.comicSiteId = fe_comic_sites.comicSiteId
        ORDER BY RAND()
        LIMIT 1
    `;

    let [rows] = await conn.query(sql);

    res.json(rows[0]);

});


// it displays the add comic form
app.get("/addComic", async (req, res) => {
    let sql = `
        SELECT *
        FROM fe_comic_sites
        ORDER BY comicSiteName
    `;

    let [sites] = await conn.query(sql);

    res.render("addComic", { sites: sites 

    });
});




// This adds new comic on the database
app.post("/addComic", async (req, res) => {

    let sql = `
        INSERT INTO fe_comics
        (comicTitle, comicUrl, comicDate, comicSiteId)
        VALUES (?, ?, ?, ?)
    `;

    let values = [
        req.body.comicTitle,
        req.body.comicUrl,
        req.body.comicDate,
        req.body.comicSiteId
    ];

    await conn.query(sql, values);

    res.redirect("/");

});


//  it displays the comic for the selected site
app.get("/comicPage/:siteId", async (req, res) => {

    let siteSql = `
        SELECT *
        FROM fe_comic_sites
        WHERE comicSiteId = ?
    `;

    let comicsSql = `
        SELECT *
        FROM fe_comics
        WHERE comicSiteId = ?
        ORDER BY comicDate DESC
    `;

    let [siteRows] = await conn.query(
        siteSql,
        [req.params.siteId]
    );

    let [comics] = await conn.query(
        comicsSql,
        [req.params.siteId]
    );

    res.render("comicPage", {
        site: siteRows[0],
        comics: comics
    });

});


// it displays the add comment form
app.get("/addComment/:comicId", async (req, res) => {

    let sql = `
        SELECT *
        FROM fe_comics
        WHERE comicId = ?
    `;

    let [rows] = await conn.query(
        sql,
        [req.params.comicId]
    );

    res.render("addComment", {
        comic: rows[0]
    });

});


// to add comment to the database or specific comic
app.post("/addComment/:comicId", async (req, res) => {

    let sql = `
        INSERT INTO fe_comments
        (author, email, comment, comicId)
        VALUES (?, ?, ?, ?)
    `;

    let values = [
        req.body.author,
        req.body.email,
        req.body.comment,
        req.params.comicId
    ];

    await conn.query(sql, values);

    res.redirect(
        `/comicPage/${req.body.comicSiteId}`
    );

});


// To view the comments web api
app.get("/api/comments/:comicId", async (req, res) => {

    let sql = `
        SELECT *
        FROM fe_comments
        WHERE comicId = ?
        ORDER BY commentId DESC
    `;

    let [comments] = await conn.query(
        sql,
        [req.params.comicId]
    );

    res.json(comments);

});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});