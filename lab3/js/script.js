document.addEventListener("DOMContentLoaded", function () {
    loadStates();

    document.querySelector("#zip")
        .addEventListener("change", displayCity);

    document.querySelector("#username")
        .addEventListener("change", checkUsername);

    document.querySelector("#signupForm")
        .addEventListener("submit", validateForm);
});


// Lesson 2: Display ZIP code information
async function displayCity() {
    let zipCode = document.querySelector("#zip").value.trim();

    let city = document.querySelector("#city");
    let latitude = document.querySelector("#latitude");
    let longitude = document.querySelector("#longitude");

    if (zipCode.length === 0) {
        city.textContent = "";
        latitude.textContent = "";
        longitude.textContent = "";
        return;
    }

    try {
        let url =
            `https://csumb.space/api/cityInfoAPI.php?zip=${encodeURIComponent(zipCode)}`;

        let response = await fetch(url);
        let data = await response.json();

        if (data === false) {
            city.textContent = "ZIP code not found";
            latitude.textContent = "";
            longitude.textContent = "";
            return;
        }

        city.textContent = data.city;
        latitude.textContent = data.latitude;
        longitude.textContent = data.longitude;

    } catch (error) {
        city.textContent = "Unable to retrieve ZIP code information";
        latitude.textContent = "";
        longitude.textContent = "";

        console.error(error);
    }
}


// Lesson 3: Load all states
async function loadStates() {
    let stateMenu = document.querySelector("#state");

    stateMenu.textContent = "";

    let defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select One";
    stateMenu.appendChild(defaultOption);

    try {
        let url = "https://csumb.space/api/allStatesAPI.php";

        let response = await fetch(url);
        let data = await response.json();

        for (let item of data) {
            let option = document.createElement("option");

            option.value = item.usps;
            option.textContent = item.state;

            stateMenu.appendChild(option);
        }

    } catch (error) {
        console.error(error);

        stateMenu.textContent = "";

        let errorOption = document.createElement("option");
        errorOption.value = "";
        errorOption.textContent = "Unable to load states";

        stateMenu.appendChild(errorOption);
    }
}


// Lesson 4: Check username availability
async function checkUsername() {
    let username =
        document.querySelector("#username").value.trim();

    let usernameError =
        document.querySelector("#usernameError");

    if (username.length === 0) {
        usernameError.textContent = "Username required";
        usernameError.style.color = "red";
        return false;
    }

    try {
        let url =
            `https://csumb.space/api/usernamesAPI.php?username=${encodeURIComponent(username)}`;

        let response = await fetch(url);
        let data = await response.json();

        if (data.available) {
            usernameError.textContent = "Username available!";
            usernameError.style.color = "green";
            return true;
        } else {
            usernameError.textContent = "Username taken";
            usernameError.style.color = "red";
            return false;
        }

    } catch (error) {
        usernameError.textContent = "Unable to check username";
        usernameError.style.color = "red";

        console.error(error);
        return false;
    }
}


// Lesson 5: Validate the form
async function validateForm(event) {
    event.preventDefault();

    let isValid = true;

    let username =
        document.querySelector("#username").value.trim();

    let usernameError =
        document.querySelector("#usernameError");

    let password =
        document.querySelector("#password").value;

    let passwordAgain =
        document.querySelector("#passwordAgain").value;

    let passwordError =
        document.querySelector("#passwordError");

    usernameError.textContent = "";
    passwordError.textContent = "";

    // Validate username
    if (username.length === 0) {
        usernameError.textContent = "Username required";
        usernameError.style.color = "red";
        isValid = false;
    } else {
        let usernameAvailable = await checkUsername();

        if (usernameAvailable === false) {
            isValid = false;
        }
    }

    // Validate password length
    if (password.length < 6) {
        passwordError.textContent =
            "Password must have at least 6 characters";

        passwordError.style.color = "red";
        isValid = false;

    // Validate matching passwords
    } else if (password !== passwordAgain) {
        passwordError.textContent =
            "Passwords do not match";

        passwordError.style.color = "red";
        isValid = false;
    }

    // Submit only when everything is valid
    if (isValid) {
        document.querySelector("#signupForm").submit();
    }
}