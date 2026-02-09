const passwordBox = document.getElementById("password");
const lengthRange = document.getElementById("lengthRange");
const lengthValue = document.getElementById("lengthValue");
const includeUppercase = document.getElementById("includeUppercase");
const includeLowercase = document.getElementById("includeLowercase");
const includeNumbers = document.getElementById("includeNumbers");
const includeSymbols = document.getElementById("includeSymbols");
const requireEachType = document.getElementById("requireEachType");
const strengthValue = document.getElementById("strengthValue");

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = "@#$%^&*()_+~|}{[]></-=";

// Initialize UI values
if (lengthRange && lengthValue) {
    lengthValue.textContent = lengthRange.value;
    lengthRange.addEventListener("input", () => {
        lengthValue.textContent = lengthRange.value;
        updateStrength();
    });
}

function getSelectedCharsets() {
    const sets = [];
    if (includeUppercase && includeUppercase.checked) sets.push(UPPERCASE);
    if (includeLowercase && includeLowercase.checked) sets.push(LOWERCASE);
    if (includeNumbers && includeNumbers.checked) sets.push(NUMBERS);
    if (includeSymbols && includeSymbols.checked) sets.push(SYMBOLS);
    return sets;
}

function pickRandomChar(charset) {
    const index = Math.floor(Math.random() * charset.length);
    return charset[index];
}

function shuffleString(str) {
    const array = str.split("");
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join("");
}

function createPassword() {
    if (!lengthRange) return;

    const length = parseInt(lengthRange.value, 10);
    const selectedSets = getSelectedCharsets();

    if (selectedSets.length === 0) {
        alert("Please select at least one character type.");
        return;
    }

    let passwordChars = [];

    // Ensure at least one character from each selected type if requested
    if (requireEachType && requireEachType.checked) {
        selectedSets.forEach(set => {
            passwordChars.push(pickRandomChar(set));
        });
    }

    // Fill remaining length with random chars from all selected sets combined
    const allChars = selectedSets.join("");
    while (passwordChars.length < length) {
        passwordChars.push(pickRandomChar(allChars));
    }

    // Shuffle to avoid predictable ordering
    const password = shuffleString(passwordChars.join("")).slice(0, length);

    if (passwordBox) {
        passwordBox.value = password;
    }

    updateStrength(password);
}

function estimateStrength(length, setCount, includesSymbols) {
    if (setCount === 0 || length < 8) {
        return { label: "Weak", className: "strength-weak" };
    }

    const entropyFactor = setCount + (includesSymbols ? 0.5 : 0);
    const score = length * entropyFactor;

    if (score >= 80) {
        return { label: "Strong", className: "strength-strong" };
    } else if (score >= 45) {
        return { label: "Medium", className: "strength-medium" };
    } else {
        return { label: "Weak", className: "strength-weak" };
    }
}

function updateStrength(passwordOverride) {
    if (!lengthRange || !strengthValue) return;

    const length = parseInt(lengthRange.value, 10);
    const selectedSets = getSelectedCharsets();
    const includesSymbols = includeSymbols && includeSymbols.checked;

    const { label, className } = estimateStrength(length, selectedSets.length, includesSymbols);

    strengthValue.textContent = label;
    strengthValue.classList.remove("strength-weak", "strength-medium", "strength-strong");
    strengthValue.classList.add(className);
}

function copyPassword() {
    if (!passwordBox || !passwordBox.value) {
        alert("Generate a password first before copying.");
        return;
    }

    const text = passwordBox.value;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
            .then(() => {
                alert("Password copied to clipboard.");
            })
            .catch(() => {
                // Fallback to older API
                passwordBox.select();
                document.execCommand("copy");
                alert("Password copied to clipboard.");
            });
    } else {
        passwordBox.select();
        document.execCommand("copy");
        alert("Password copied to clipboard.");
    }
}

// Initialize strength indicator on load
updateStrength();
