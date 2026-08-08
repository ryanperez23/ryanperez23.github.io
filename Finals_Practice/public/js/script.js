// request a random comic from the api
async function displayRandomComic() {

    // get a random comic
    let response = await fetch("/api/randomComic");

    // convert the response to json
    let comic = await response.json();


    // display the comic title
    document.querySelector("#randomTitle").textContent =
        comic.comicTitle;


    // display the comic image
    document.querySelector("#randomImage").src =
        comic.comicUrl;


    // add text for the comic image
    document.querySelector("#randomImage").alt =
        comic.comicTitle;


    // display the comic site name
    document.querySelector("#randomSiteName").textContent =
        comic.comicSiteName;
}


// display comments for one comic
async function viewComments(comicId) {

    // request comments from the api
    let response = await fetch(
        `/api/comments/${comicId}`
    );


    // convert the response to json
    let comments = await response.json();


    // get the comment area
    let commentList =
        document.querySelector("#commentList");


    // clear old comments
    commentList.innerHTML = "";


    // check if there are no comments
    if (comments.length === 0) {

        commentList.textContent =
            "No comments yet.";

    }


    // display each comment
    comments.forEach(item => {

        // create a box for the comment
        let commentBox =
            document.createElement("div");


        // create the author name
        let author =
            document.createElement("strong");


        // create the comment text
        let comment =
            document.createElement("p");


        // add the author name
        author.textContent =
            item.author;


        // add the comment text
        comment.textContent =
            item.comment;


        // add the author to the box
        commentBox.appendChild(author);


        // add the comment to the box
        commentBox.appendChild(comment);


        // display the comment box
        commentList.appendChild(commentBox);

    });


    // create the comments popup
    let commentsModal =
        new bootstrap.Modal(
            document.querySelector("#commentsModal")
        );


    // show the comments popup
    commentsModal.show();

}