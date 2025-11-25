// Handle theme changes (event type #1: "click")
const themeToggle = document.querySelector("#themeToggle");
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

const form = document.querySelector("#registrationForm");
const successCard = document.querySelector("#successMessage");
const successCopy = document.querySelector("#successCopy");
const formCard = document.querySelector("#formCard");
const successActionBtn = document.querySelector("#successAction");

const fields = {
  name: {
    input: document.querySelector("#name"),
    errorEl: document.querySelector("#nameError"),
  },
  email: {
    input: document.querySelector("#email"),
    errorEl: document.querySelector("#emailError"),
  },
  password: {
    input: document.querySelector("#password"),
    errorEl: document.querySelector("#passwordError"),
  },
};

const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

const passwordChecklist = document.querySelector("#passwordChecklist");
const checklistItems = passwordChecklist
  ? Array.from(passwordChecklist.querySelectorAll("li[data-rule]"))
  : [];
const strengthValue = document.querySelector("#strengthValue");
const strengthFill = document.querySelector("#strengthFill");
const togglePasswordButton = document.querySelector("#togglePassword");
const passwordInput = fields.password.input;
const passwordField = document.querySelector(".password-field");
const particleLayer = document.querySelector("#particleLayer");

const passwordRules = {
  length: (value) => value.length >= 12,
  uppercase: (value) => /[A-Z]/.test(value),
  lowercase: (value) => /[a-z]/.test(value),
  number: (value) => /\d/.test(value),
  special: (value) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value),
};

// Live validation (event type #2: "input")
Object.values(fields).forEach(({ input }) => {
  input.addEventListener("input", () => {
    validateField(input);
    if (input === passwordInput) {
      handlePasswordInput();
    }
  });
});

function validateField(input) {
  const { name, value } = input;
  let message = "";

  if (!value.trim()) {
    message = "This field is required.";
  } else if (name === "email" && !emailRegex.test(value)) {
    message = "Please enter a valid email address.";
  } else if (name === "password" && !meetsPasswordPolicy(value)) {
    message =
      "Password must be 12+ characters with upper, lower, number, and special symbol.";
  }

  const { errorEl } = fields[name];
  errorEl.textContent = message;
  input.classList.toggle("error-state", Boolean(message));

  return !message;
}

function meetsPasswordPolicy(value) {
  const state = getPasswordState(value);
  return Object.values(state).every(Boolean);
}

function getPasswordState(value) {
  return Object.keys(passwordRules).reduce((acc, key) => {
    acc[key] = passwordRules[key](value);
    return acc;
  }, {});
}

function handlePasswordInput() {
  const value = passwordInput.value;
  const state = getPasswordState(value);
  const allPassed = Object.values(state).every(Boolean);

  updateChecklist(state, allPassed);
  updateStrength(state, value.length);
}

function updateChecklist(state, allPassed) {
  checklistItems.forEach((item) => {
    const rule = item.dataset.rule;
    const passed = state[rule];
    item.classList.toggle("passed", Boolean(passed));
  });

  if (!passwordChecklist) return;

  passwordChecklist.classList.toggle(
    "resolved",
    allPassed && !!passwordInput.value
  );
}

function updateStrength(state, length) {
  if (!strengthFill || !strengthValue) return;

  const score = Object.values(state).filter(Boolean).length;
  const progress = length === 0 ? 0 : (score / Object.keys(state).length) * 100;

  let label = "Weak";
  let className = "is-weak";
  if (score >= 3 && score < 5) {
    label = "Fair";
    className = "is-fair";
  } else if (score === 5) {
    label = "Strong";
    className = "is-strong";
  }

  strengthValue.textContent = label;
  strengthValue.classList.remove("is-weak", "is-fair", "is-strong");
  strengthValue.classList.add(className);

  if (label === "Strong") {
    strengthFill.classList.remove("is-strong");
    void strengthFill.offsetWidth; // retrigger animation
    strengthFill.classList.add("is-strong");
  } else {
    strengthFill.classList.remove("is-strong");
  }
  strengthFill.style.width = `${progress}%`;

  const backgrounds = {
    "is-weak": `linear-gradient(120deg, var(--error), #f87171)`,
    "is-fair": `linear-gradient(120deg, var(--warning), var(--accent))`,
    "is-strong": `linear-gradient(120deg, var(--success), var(--accent-dark))`,
  };
  strengthFill.style.background = backgrounds[className];
}

if (togglePasswordButton && passwordInput) {
  togglePasswordButton.addEventListener("click", () => {
    const isVisible = passwordInput.type === "text";
    passwordInput.type = isVisible ? "password" : "text";
    togglePasswordButton.setAttribute("aria-pressed", String(!isVisible));
    togglePasswordButton.dataset.visible = String(!isVisible);
  });
}

if (passwordField && passwordInput) {
  passwordField.addEventListener("focusin", () => {
    passwordField.classList.add("show-checklist", "is-focused");
  });

  passwordField.addEventListener("focusout", () => {
    setTimeout(() => {
      if (!passwordField.contains(document.activeElement)) {
        passwordField.classList.remove("show-checklist", "is-focused");
      }
    }, 50);
  });
}

function showSuccessCard() {
  if (!successCard) return;
  successCard.classList.remove("hidden");
  requestAnimationFrame(() => {
    successCard.classList.add("is-active");
  });
}

function hideSuccessCard(callback) {
  if (!successCard) {
    if (typeof callback === "function") callback();
    return;
  }
  successCard.classList.remove("is-active");
  setTimeout(() => {
    successCard.classList.add("hidden");
    if (typeof callback === "function") callback();
  }, 350);
}

function createParticles(count = 28) {
  if (!particleLayer) return;
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < count; i += 1) {
    const particle = document.createElement("span");
    particle.className = "particle";
    particle.style.setProperty(
      "--size",
      `${(Math.random() * 6 + 4).toFixed(2)}px`
    );
    particle.style.setProperty("--left", `${Math.random() * 100}%`);
    particle.style.setProperty(
      "--duration",
      `${(8 + Math.random() * 10).toFixed(2)}s`
    );
    particle.style.setProperty("--delay", `${(Math.random() * 4).toFixed(2)}s`);
    fragment.appendChild(particle);
  }
  particleLayer.innerHTML = "";
  particleLayer.appendChild(fragment);
}

function activateFormEntrance() {
  if (!formCard) return;
  requestAnimationFrame(() => {
    formCard.classList.add("is-ready");
  });
}

createParticles();
activateFormEntrance();
handlePasswordInput();

if (successActionBtn) {
  successActionBtn.addEventListener("click", () => {
    hideSuccessCard(() => {
      formCard.classList.remove("hidden");
      formCard.classList.remove("is-ready");
      requestAnimationFrame(() => formCard.classList.add("is-ready"));
    });
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const isValid = Object.values(fields).every(({ input }) =>
    validateField(input)
  );

  if (!isValid) return;

  const formData = new FormData(form);
  const collectedData = Object.fromEntries(formData.entries());
  console.table(collectedData); // Demonstrates data collection on submit

  form.reset();
  Object.values(fields).forEach(({ errorEl, input }) => {
    errorEl.textContent = "";
    input.classList.remove("error-state");
  });
  handlePasswordInput();

  formCard.classList.add("hidden");
  const displayName = collectedData.name || "friend";
  const displayEmail = collectedData.email || "your inbox";
  successCopy.textContent = `Welcome aboard, ${displayName}! Check ${displayEmail} for next steps.`;
  showSuccessCard();
});
