const searchForm = document.querySelector("#searchForm");
const characterNameInput =
    document.querySelector("#characterName");
const speciesMenu =
    document.querySelector("#species");
const errorMessage =
    document.querySelector("#errorMessage");
const resultMessage =
    document.querySelector("#resultMessage");
const characterResults =
    document.querySelector("#characterResults");

searchForm.addEventListener("submit", searchCharacters);


async function searchCharacters(event) {
    event.preventDefault();

    const characterName =
        characterNameInput.value.trim();

    const species =
        speciesMenu.value;

    errorMessage.textContent = "";
    resultMessage.textContent = "";
    characterResults.innerHTML = "";

    if (characterName.length === 0) {
        errorMessage.textContent =
            "Please enter a character name.";

        characterNameInput.focus();
        return;
    }

    if (characterName.length < 2) {
        errorMessage.textContent =
            "The character name must have at least 2 characters.";

        characterNameInput.focus();
        return;
    }

    resultMessage.textContent =
        "Searching for characters...";

    let url =
        "https://rickandmortyapi.com/api/character/" +
        `?name=${encodeURIComponent(characterName)}`;

    if (species !== "") {
        url +=
            `&species=${encodeURIComponent(species)}`;
    }

    try {
        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(
                    "No matching characters were found."
                );
            }

            throw new Error(
                "Unable to retrieve character information."
            );
        }

        const data = await response.json();

        resultMessage.textContent =
            `${data.results.length} character(s) found`;

        displayCharacters(data.results);

    } catch (error) {
        resultMessage.textContent = "";
        errorMessage.textContent = error.message;
        console.error(error);
    }
}


function displayCharacters(characters) {
    characterResults.innerHTML = "";

    for (const character of characters) {
        const card = document.createElement("article");
        card.classList.add("character-card");

        const image = document.createElement("img");
        image.src = character.image;
        image.alt = character.name;

        const information =
            document.createElement("div");

        information.classList.add(
            "character-information"
        );

        const name = document.createElement("h2");
        name.textContent = character.name;

        const status = createInformationLine(
            "Status",
            character.status
        );

        const species = createInformationLine(
            "Species",
            character.species
        );

        const gender = createInformationLine(
            "Gender",
            character.gender
        );

        const origin = createInformationLine(
            "Origin",
            character.origin.name
        );

        const location = createInformationLine(
            "Last Location",
            character.location.name
        );

        information.append(
            name,
            status,
            species,
            gender,
            origin,
            location
        );

        card.append(image, information);
        characterResults.appendChild(card);
    }
}


function createInformationLine(label, value) {
    const paragraph = document.createElement("p");

    const labelText = document.createElement("strong");
    labelText.textContent = `${label}: `;

    const valueText = document.createTextNode(value);

    paragraph.append(labelText, valueText);

    return paragraph;
}