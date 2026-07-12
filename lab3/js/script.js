// The rubric says to call this function directly
// instead of using a page-load event listener.
loadStates();


// Event listeners
document.querySelector("#zip")
    .addEventListener("change", displayCity);

document.querySelector("#state")
    .addEventListener("change", displayCounties);

document.querySelector("#username")
    .addEventListener("change", checkUsername);

document.querySelector("#password")
    .addEventListener("click", displaySuggestedPassword);

document.querySelector("#signupForm")
    .addEventListener("submit", validateForm);


// Display the city, latitude, and longitude
async function displayCity() {
    let zipCode = document.querySelector("#zip").value;

    let city = document.querySelector("#city");
    let latitude = document.querySelector("#latitude");
    let longitude = document.querySelector("#longitude");
    let zipError = document.querySelector("#zipError");

    city.textContent = "";
    latitude.textContent = "";
    longitude.textContent = "";
    zipError.textContent = "";

    if (zipCode.length === 0) {
        return;
    }

    try {
        let url =
            `https://csumb.space/api/cityInfoAPI.php?zip=${zipCode}`;

        let response = await fetch(url);
        let data = await response.json();

        // The API returns false when the ZIP code is not found
        if (data === false) {
            zipError.textContent = "Zip code not found";
            return;
        }

        city.textContent = data.city;
        latitude.textContent = data.latitude;
        longitude.textContent = data.longitude;

    } catch (error) {
        zipError.textContent =
            "Unable to retrieve ZIP code information";

        console.error(error);
    }
}


// Load the list of all states
async function loadStates() {
    let stateMenu = document.querySelector("#state");

    stateMenu.textContent = "";

    let defaultOption =
        document.createElement("option");

    defaultOption.value = "";
    defaultOption.textContent = "Select One";
    stateMenu.appendChild(defaultOption);

    try {
        let url =
            "https://csumb.space/api/allStatesAPI.php";

        let response = await fetch(url);
        let data = await response.json();

        for (let item of data) {
            let option =
                document.createElement("option");

            option.value = item.usps;
            option.textContent = item.state;

            stateMenu.appendChild(option);
        }

    } catch (error) {
        console.error(error);

        stateMenu.textContent = "";

        let errorOption =
            document.createElement("option");

        errorOption.value = "";
        errorOption.textContent =
            "Unable to load states";

        stateMenu.appendChild(errorOption);
    }
}


// Load counties when a state is selected
async function displayCounties() {
    let state =
        document.querySelector("#state").value;

    let countyMenu =
        document.querySelector("#county");

    countyMenu.textContent = "";

    if (state.length === 0) {
        let defaultOption =
            document.createElement("option");

        defaultOption.value = "";
        defaultOption.textContent =
            "Select a state first";

        countyMenu.appendChild(defaultOption);

        return;
    }

    let loadingOption =
        document.createElement("option");

    loadingOption.value = "";
    loadingOption.textContent =
        "Loading counties...";

    countyMenu.appendChild(loadingOption);

    try {
        let url =
            `https://csumb.space/api/countyListAPI.php?state=${state}`;

        let response = await fetch(url);
        let data = await response.json();

        countyMenu.textContent = "";

        let defaultOption =
            document.createElement("option");

        defaultOption.value = "";
        defaultOption.textContent =
            "Select One";

        countyMenu.appendChild(defaultOption);

        for (let item of data) {
            let option =
                document.createElement("option");

            /*
             * The API normally returns an object with
             * a county property. The string check also
             * supports a list of county names.
             */
            let countyName =
                typeof item === "string"
                    ? item
                    : item.county || item.name;

            option.value = countyName;
            option.textContent = countyName;

            countyMenu.appendChild(option);
        }

    } catch (error) {
        console.error(error);

        countyMenu.textContent = "";

        let errorOption =
            document.createElement("option");

        errorOption.value = "";
        errorOption.textContent =
            "Unable to load counties";

        countyMenu.appendChild(errorOption);
    }
}


// Check username availability
async function checkUsername() {
    let username =
        document.querySelector("#username").value;

    let usernameError =
        document.querySelector("#usernameError");

    if (username.length === 0) {
        usernameError.textContent =
            "Username required";

        usernameError.style.color = "red";

        return false;
    }

    try {
        let url =
            `https://csumb.space/api/usernamesAPI.php?username=${username}`;

        let response = await fetch(url);
        let data = await response.json();

        if (data.available) {
            usernameError.textContent =
                "Username available!";

            usernameError.style.color = "green";

            return true;

        } else {
            usernameError.textContent =
                "Username taken";

            usernameError.style.color = "red";

            return false;
        }

    } catch (error) {
        usernameError.textContent =
            "Unable to check username";

        usernameError.style.color = "red";

        console.error(error);

        return false;
    }
}


// Display a suggested password
async function displaySuggestedPassword() {
    let suggestedPassword =
        document.querySelector("#suggestedPassword");

    suggestedPassword.textContent =
        "Loading suggested password...";

    try {
        let url =
            "https://csumb.space/api/suggestedPassword.php?length=8";

        let response = await fetch(url);

        /*
         * Reading the response as text allows the code
         * to support either plain text or JSON.
         */
        let responseText = await response.text();
        let passwordSuggestion = "";

        try {
            let data = JSON.parse(responseText);

            if (typeof data === "string") {
                passwordSuggestion = data;

            } else {
                passwordSuggestion =
                    data.password ||
                    data.suggestedPassword ||
                    data.suggested_password;
            }

        } catch (error) {
            passwordSuggestion = responseText;
        }

        passwordSuggestion =
            passwordSuggestion.replace(/^"|"$/g, "");

        suggestedPassword.textContent =
            `Suggested password: ${passwordSuggestion}`;

    } catch (error) {
        suggestedPassword.textContent =
            "Unable to display a suggested password";

        console.error(error);
    }
}


// Validate the form before submitting
async function validateForm(event) {
    event.preventDefault();

    let isValid = true;

    let username =
        document.querySelector("#username").value;

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
        usernameError.textContent =
            "Username required";

        usernameError.style.color = "red";

        isValid = false;

    } else {
        let usernameAvailable =
            await checkUsername();

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

    // Validate that the passwords match
    } else if (password !== passwordAgain) {
        passwordError.textContent =
            "Passwords do not match";

        passwordError.style.color = "red";

        isValid = false;
    }

    // Submit the form if everything is valid
    if (isValid) {
        document.querySelector("#signupForm").submit();
    }
}