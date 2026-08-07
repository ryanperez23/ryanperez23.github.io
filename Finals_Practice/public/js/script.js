const randomComicButton =
    document.querySelector("#randomComicButton");

if (randomComicButton) {

    randomComicButton.addEventListener("click", async () => {

        const response = await fetch("/api/randomComic");

        const comic = await response.json();

        document.querySelector("#randomComicImage").src =
            comic.comicUrl;

        document.querySelector("#randomComicImage").alt =
            comic.comicTitle;

        document.querySelector("#randomComicTitle").textContent =
            comic.comicTitle;

        document.querySelector("#randomComicName").textContent =
            comic.comicSiteName;
    });
}


async function viewComments(comicId) {

    const response =
        await fetch(`/api/comments/${comicId}`);

    const comments =
        await response.json();

    const commentList =
        document.querySelector("#commentList");

    commentList.innerHTML = "";

    if (comments.length === 0) {

        const message = document.createElement("p");
        message.textContent = "No comments yet.";

        commentList.appendChild(message);

    } else {

        comments.forEach(comment => {

            const container =
                document.createElement("div");

            container.classList.add("comment");

            const author =
                document.createElement("strong");

            author.textContent = comment.author;

            const text =
                document.createElement("p");

            text.textContent = comment.comment;

            container.appendChild(author);
            container.appendChild(text);

            commentList.appendChild(container);
        });
    }

    const modal =
        new bootstrap.Modal(
            document.querySelector("#commentsModal")
        );

    modal.show();
}