document.addEventListener("DOMContentLoaded", () => {
    const authorLinks = document.querySelectorAll(".author-link");

    for (const authorLink of authorLinks) {
        authorLink.addEventListener("click", getAuthorInfo);
    }
});

async function getAuthorInfo(event) {
    event.preventDefault();

    const authorId = event.currentTarget.dataset.authorId;
    const authorInfo = document.querySelector("#authorInfo");
    const modalElement = document.querySelector("#authorModal");

    const authorModal =
        bootstrap.Modal.getOrCreateInstance(modalElement);

    authorInfo.innerHTML = `
        <div class="text-center py-4">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">
                    Loading...
                </span>
            </div>
        </div>
    `;

    authorModal.show();

    try {
        const response = await fetch(`/api/author/${authorId}`);

        if (!response.ok) {
            throw new Error("Unable to retrieve author information");
        }

        const data = await response.json();
        const author = data[0];

        if (!author) {
            throw new Error("Author not found");
        }

        const dateOfBirth = formatDate(author.dob);
        const dateOfDeath = author.dod
            ? formatDate(author.dod)
            : "N/A";

        const sex =
            author.sex === "M"
                ? "Male"
                : author.sex === "F"
                    ? "Female"
                    : author.sex;

        authorInfo.innerHTML = `
            <div class="author-profile">

                <img
                    src="${escapeHtml(author.portrait)}"
                    alt="${escapeHtml(
                        `${author.firstName} ${author.lastName}`
                    )}"
                    class="author-portrait"
                >

                <h3>
                    ${escapeHtml(author.firstName)}
                    ${escapeHtml(author.lastName)}
                </h3>

                <p>
                    <strong>Born:</strong>
                    ${escapeHtml(dateOfBirth)}
                </p>

                <p>
                    <strong>Died:</strong>
                    ${escapeHtml(dateOfDeath)}
                </p>

                <p>
                    <strong>Sex:</strong>
                    ${escapeHtml(sex)}
                </p>

                <p>
                    <strong>Profession:</strong>
                    ${escapeHtml(author.profession)}
                </p>

                <p>
                    <strong>Country:</strong>
                    ${escapeHtml(author.country)}
                </p>

                <p class="author-biography">
                    <strong>Biography:</strong><br>
                    ${escapeHtml(author.biography)}
                </p>

            </div>
        `;
    } catch (error) {
        console.error("Author information error:", error);

        authorInfo.innerHTML = `
            <div class="alert alert-danger mb-0">
                Unable to load the author's information.
            </div>
        `;
    }
}

function formatDate(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC"
    });
}

function escapeHtml(value) {
    return String(value ?? "").replace(
        /[&<>"']/g,
        (character) => {
            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            };

            return entities[character];
        }
    );
}