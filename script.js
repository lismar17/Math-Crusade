let currentUser = null;
let currentProblem = null;
let userScore = 0;
let currentLevel = null;

// Simulated user data storage
const users = new Map();

// Level unlock thresholds
const levelUnlocks = {
  subtraction: 5,
  multiplication: 10,
  division: 15,
};

function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (username && password) {
    currentUser = username;
    if (!users.has(username)) {
      users.set(username, { score: 0, progress: {} });
    }
    document.getElementById("login-section").style.display = "none";
    document.getElementById("game-section").style.display = "block";
    loadUserProgress();
  }
}

function logout() {
  currentUser = null;
  userScore = 0;
  currentProblem = null;
  currentLevel = null;
  document.getElementById("game-section").style.display = "none";
  document.getElementById("problem-section").style.display = "none";
  document.getElementById("login-section").style.display = "block";
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
}

function loadUserProgress() {
  const userData = users.get(currentUser);
  userScore = userData.score || 0;
  document.getElementById("score").textContent = userScore;
  updateUnlockedLevels();
}

function updateUnlockedLevels() {
  Object.entries(levelUnlocks).forEach(([level, requiredScore]) => {
    const levelElement = document.getElementById(`${level}-level`);
    if (userScore >= requiredScore) {
      levelElement.classList.remove("locked");
      levelElement.querySelector(".lock-icon").style.display = "none";
      levelElement.onclick = () => startLevel(level);
    }
  });
}

function saveProgress() {
  if (currentUser) {
    users.get(currentUser).score = userScore;
  }
}

function generateOptions(answer) {
  const options = [answer];
  while (options.length < 3) {
    // Generate two additional options
    const offset = Math.floor(Math.random() * 5) + 1;
    const newOption = answer + (Math.random() < 0.5 ? offset : -offset);
    if (!options.includes(newOption)) {
      options.push(newOption);
    }
  }
  return options.sort(() => Math.random() - 0.5);
}

function generateProblem(type) {
  let num1, num2, answer, symbol;

  switch (type) {
    case "addition":
      num1 = Math.floor(Math.random() * 100);
      num2 = Math.floor(Math.random() * 100);
      answer = num1 + num2;
      symbol = "+";
      break;
    case "subtraction":
      num1 = Math.floor(Math.random() * 100);
      num2 = Math.floor(Math.random() * num1);
      answer = num1 - num2;
      symbol = "-";
      break;
    case "multiplication":
      num1 = Math.floor(Math.random() * 12);
      num2 = Math.floor(Math.random() * 12);
      answer = num1 * num2;
      symbol = "×";
      break;
    case "division":
      num2 = Math.floor(Math.random() * 11) + 1;
      answer = Math.floor(Math.random() * 10);
      num1 = num2 * answer;
      symbol = "÷";
      break;
  }

  const options = generateOptions(answer);
  return {
    display: `${num1} ${symbol} ${num2} = ?`,
    answer: answer,
    options: options,
    type: type,
  };
}

function startLevel(type) {
  if (currentUser) {
    currentLevel = type;
    document.getElementById("game-section").style.display = "none";
    document.getElementById("problem-section").style.display = "block";
    loadNextProblem();
  }
}

function loadNextProblem() {
  currentProblem = generateProblem(currentLevel);
  document.getElementById("problem").textContent = currentProblem.display;

  // Update option buttons
  const optionBtns = document.querySelectorAll(".option-btn");
  optionBtns.forEach((btn, index) => {
    btn.textContent = currentProblem.options[index];
    btn.onclick = () => checkAnswer(currentProblem.options[index]);
  });
}

function showScoreAnimation(isCorrect) {
  const scoreContainer = document.querySelector(".score-container");
  const scoreChange = document.createElement("div");
  scoreChange.className = `score-change ${
    isCorrect ? "score-increase" : "score-decrease"
  }`;
  scoreChange.textContent = isCorrect ? "+1" : "-1";
  scoreContainer.appendChild(scoreChange);
  setTimeout(() => scoreChange.remove(), 1000);
}

function checkAnswer(selectedAnswer) {
  if (selectedAnswer === currentProblem.answer) {
    userScore += 1;
    document.getElementById("score").textContent = userScore;
    showScoreAnimation(true);
    saveProgress();
    updateUnlockedLevels();
    loadNextProblem();
  } else {
    // Deduct point but don't go below 0
    if (userScore > 0) {
      userScore -= 1;
      document.getElementById("score").textContent = userScore;
      showScoreAnimation(false);
      saveProgress();
      updateUnlockedLevels();
    }

    // Visual feedback for wrong answer
    const options = document.querySelectorAll(".option-btn");
    options.forEach((option) => {
      if (parseInt(option.textContent) === selectedAnswer) {
        option.classList.add("wrong-answer");
        setTimeout(() => {
          option.classList.remove("wrong-answer");
        }, 1000);
      }
    });
  }
}

function returnToLevels() {
  document.getElementById("problem-section").style.display = "none";
  document.getElementById("game-section").style.display = "block";
}

document
  .getElementById("backToLevels")
  .addEventListener("click", returnToLevels);
