// Event Listeners
document.querySelector("#guessBtn").addEventListener("click", checkGuess);
document.querySelector("#resetBtn").addEventListener("click", initializeGame);

// Global variables
let randomNumber;
let attempts = 0;
let wins = 0;
let losses = 0;

initializeGame();

function initializeGame() {
    randomNumber = Math.floor(Math.random() * 99) + 1;
    console.log("Random number: " + randomNumber);

    attempts = 0;

    // hiding the Reset button
    document.querySelector("#resetBtn").style.display = "none";

    // showing the Guess button
    document.querySelector("#guessBtn").style.display = "inline";

    let playerGuess = document.querySelector("#playerGuess");
    playerGuess.focus();
    playerGuess.value = "";

    let feedback = document.querySelector("#feedback");
    feedback.textContent = "";

    // clearing previous guesses
    document.querySelector("#guesses").textContent = "";

    // reset attempts left
    document.querySelector("#attemptsLeft").textContent = 7;
}

function checkGuess() {
    let feedback = document.querySelector("#feedback");
    feedback.textContent = "";

    let guess = document.querySelector("#playerGuess").value;
    console.log("Player guess: " + guess);

    if (guess < 1 || guess > 99 || guess === "") {
        feedback.textContent = "Enter a number between 1 and 99";
        feedback.style.color = "red";
        return;
    }

    attempts++;
    console.log("Attempts: " + attempts);

    let attemptsLeft = 7 - attempts;
    document.querySelector("#attemptsLeft").textContent = attemptsLeft;

    feedback.style.color = "orange";

    if (guess == randomNumber) {
        feedback.textContent = "You guessed it! You won!";
        feedback.style.color = "darkgreen";

        wins++;
        document.querySelector("#wins").textContent = wins;

        gameOver();
    } else {
        let guesses = document.querySelector("#guesses");

        if (guesses.textContent === "") {
            guesses.textContent += guess;
        } else {
            guesses.textContent += ", " + guess;
        }

        if (attempts == 7) {
            feedback.textContent = "Sorry, you lost! The number was " + randomNumber;
            feedback.style.color = "red";

            losses++;
            document.querySelector("#losses").textContent = losses;

            gameOver();
        } else if (guess > randomNumber) {
            feedback.textContent = "Guess was high";
        } else {
            feedback.textContent = "Guess was low";
        }
    }

    document.querySelector("#playerGuess").value = "";
    document.querySelector("#playerGuess").focus();
}

function gameOver() {
    let guessBtn = document.querySelector("#guessBtn");
    let resetBtn = document.querySelector("#resetBtn");

    guessBtn.style.display = "none";
    resetBtn.style.display = "inline";
}