document.querySelector("#submitBtn").addEventListener("click", gradeQuiz);

let attempts = localStorage.getItem("total_attempts");

if (attempts === null) {
    attempts = 0;
} else {
    attempts = Number(attempts);
}

displayQ10Choices();

document.querySelector("#totalAttempts").textContent =
    "Total Times Quiz Taken: " + attempts;

function setMarkImage(index, imageName, altText) {
    let markContainer = document.querySelector(`#markImg${index}`);
    markContainer.textContent = "";

    let img = document.createElement("img");
    img.src = `img/${imageName}`;
    img.alt = altText;
    img.className = "mark-img";

    markContainer.appendChild(img);
}

function rightAnswer(index) {
    let feedback = document.querySelector(`#q${index}Feedback`);
    feedback.textContent = "Correct!";
    feedback.className = "feedback correct";

    setMarkImage(index, "checkmark.svg", "Checkmark");
}

function wrongAnswer(index) {
    let feedback = document.querySelector(`#q${index}Feedback`);
    feedback.textContent = "Incorrect!";
    feedback.className = "feedback incorrect";

    setMarkImage(index, "xmark.svg", "X mark");
}

function clearFeedback() {
    for (let i = 1; i <= 10; i++) {
        document.querySelector(`#q${i}Feedback`).textContent = "";
        document.querySelector(`#q${i}Feedback`).className = "";
        document.querySelector(`#markImg${i}`).textContent = "";
    }

    document.querySelector("#validationFdbk").textContent = "";
    document.querySelector("#congrats").textContent = "";
    document.querySelector("#totalScore").textContent = "";
}

function isFormValid() {
    let isValid = true;
    let validationFdbk = document.querySelector("#validationFdbk");

    if (document.querySelector("#q1").value.trim() === "") {
        isValid = false;
        validationFdbk.textContent = "Please answer question 1.";
    }

    return isValid;
}

function gradeQuiz() {
    clearFeedback();

    if (!isFormValid()) {
        return;
    }

    let score = 0;

    // Question 1
    let q1 = document.querySelector("#q1").value.toLowerCase().trim();

    if (q1 === "sacramento") {
        score += 10;
        rightAnswer(1);
    } else {
        wrongAnswer(1);
    }

    // Question 2
    let q2 = document.querySelector("#q2").value;

    if (q2 === "missouri") {
        score += 10;
        rightAnswer(2);
    } else {
        wrongAnswer(2);
    }

    // Question 3
    if (
        document.querySelector("#washington").checked &&
        document.querySelector("#jefferson").checked &&
        document.querySelector("#lincoln").checked &&
        document.querySelector("#roosevelt").checked &&
        !document.querySelector("#franklin").checked
    ) {
        score += 10;
        rightAnswer(3);
    } else {
        wrongAnswer(3);
    }

    // Question 4
    let q4 = document.querySelector("input[name=q4]:checked");

    if (q4 !== null && q4.value === "Rhode Island") {
        score += 10;
        rightAnswer(4);
    } else {
        wrongAnswer(4);
    }

    // Question 5
    let q5 = document.querySelector("#q5").value.toLowerCase().trim();

    if (q5 === "florida") {
        score += 10;
        rightAnswer(5);
    } else {
        wrongAnswer(5);
    }

    // Question 6
    let q6 = document.querySelector("#q6").value;

    if (q6 === "Alaska") {
        score += 10;
        rightAnswer(6);
    } else {
        wrongAnswer(6);
    }

    // Question 7
    if (
        document.querySelector("#oregon").checked &&
        document.querySelector("#nevada").checked &&
        document.querySelector("#arizona").checked &&
        !document.querySelector("#texas").checked
    ) {
        score += 10;
        rightAnswer(7);
    } else {
        wrongAnswer(7);
    }

    // Question 8
    let q8 = document.querySelector("input[name=q8]:checked");

    if (q8 !== null && q8.value === "Atlantic") {
        score += 10;
        rightAnswer(8);
    } else {
        wrongAnswer(8);
    }

    // Question 9
    let q9 = document.querySelector("#q9").value.toLowerCase().trim();

    if (
        q9 === "washington dc" ||
        q9 === "washington d.c." ||
        q9 === "washington, dc" ||
        q9 === "washington, d.c."
    ) {
        score += 10;
        rightAnswer(9);
    } else {
        wrongAnswer(9);
    }

    // Question 10
    let q10 = document.querySelector("input[name=q10]:checked");

    if (q10 !== null && q10.value === "Arizona") {
        score += 10;
        rightAnswer(10);
    } else {
        wrongAnswer(10);
    }

    let totalScore = document.querySelector("#totalScore");
    totalScore.textContent = `Total Score: ${score}/100`;

    if (score > 80) {
        totalScore.className = "text-success text-center mt-4";
        document.querySelector("#congrats").textContent =
            "Congratulations! Great job scoring above 80!";
        document.querySelector("#congrats").className =
            "alert alert-success text-center fw-bold";
    } else {
        totalScore.className = "text-danger text-center mt-4";
        document.querySelector("#congrats").textContent = "";
    }

    attempts++;
    localStorage.setItem("total_attempts", attempts);

    document.querySelector("#totalAttempts").textContent =
        "Total Times Quiz Taken: " + attempts;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));

        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function displayQ10Choices() {
    let choices = ["Arizona", "Nevada", "Utah", "Colorado"];

    shuffleArray(choices);

    let container = document.querySelector("#q10Choices");
    container.textContent = "";

    for (let choice of choices) {
        let input = document.createElement("input");
        input.type = "radio";
        input.name = "q10";
        input.id = "q10" + choice.replaceAll(" ", "");
        input.value = choice;

        let label = document.createElement("label");
        label.htmlFor = input.id;
        label.textContent = choice;

        container.appendChild(input);
        container.appendChild(label);
        container.appendChild(document.createElement("br"));
    }
}