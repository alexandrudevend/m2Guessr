const levels = [
  {
    name: "Round 1 - Easy",
    photo: "pics/zone/zone_1.png",
    map: "pics/minimap/Hwang_Temple_Interactive_Map.png",
    correct: { x: 0.522, y: 0.59 },
  },
  {
    name: "Round 2 – Easy",
    photo: "pics/zone/zone_2.png",
    map: "pics/minimap/Valley_of_Seungryong_Interactive_Map.png",
    correct: { x: 0.534, y: 0.541 },
  },
  {
    name: "Round 3 – Medium",
    photo: "pics/zone/zone_3.png",
    map: "pics/minimap/Yongan_Interactive_Map.png",
    correct: { x: 0.641, y: 0.477 },
  },
  {
    name: "Round 4 - Medium",
    photo: "pics/zone/zone_4.png",
    map: "pics/minimap/Bakra_Interactive_Map.png",
    correct: { x: 0.464, y: 0.39 },
  },
  {
    name: "Round 5 – Hard",
    photo: "pics/zone/zone_5.png",
    map: "pics/minimap/Valley_of_Seungryong_Interactive_Map.png",
    correct: { x: 0.717, y: 0.698 },
  },
];

let currentIndex = 0;
let totalScore = 0;

let guessPoint = null;
let correctPoint = null;

let hasGuessed = false;
let answerLocked = false;
let currentRoundScore = 0;

// ========================================
// DOM ELEMENTS
// ========================================

const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const finalScreen = document.getElementById("finalScreen");

const totalScoreEl = document.getElementById("totalScore");

const levelName = document.getElementById("levelName");

const photoImg = document.getElementById("photoImg");

const mapImg = document.getElementById("mapImg");

const minimapWrapper = document.getElementById("minimapWrapper");

const statusEl = document.getElementById("status");

const btnLock = document.getElementById("btnLock");

const btnNext = document.getElementById("btnNext");

const finalScoreEl = document.getElementById("finalScore");

const finalMessage = document.getElementById("finalMessage");

// ========================================
// SHOW SCREEN
// ========================================

function showScreen(screen) {
  document.querySelectorAll(".screen").forEach((s) => {
    s.classList.remove("active");
  });

  screen.classList.add("active");
}

// ========================================
// SET STATUS
// ========================================

function setStatus(text, type = "info") {
  statusEl.innerHTML = text;
  statusEl.className = "status " + type;
}

// ========================================
// CLEAR MARKERS
// ========================================

function clearMarkers() {
  minimapWrapper
    .querySelectorAll(".marker, .line")
    .forEach((el) => el.remove());
}

// ========================================
// ADD MARKER
// ========================================

function addMarker(point, cls) {
  const marker = document.createElement("div");

  marker.className = "marker " + cls;

  marker.style.left = point.x * 100 + "%";

  marker.style.top = point.y * 100 + "%";

  minimapWrapper.appendChild(marker);
}

// ========================================
// DRAW LINE
// ========================================

function drawLine(p1, p2) {
  const line = document.createElement("div");

  line.className = "line";

  const dx = (p2.x - p1.x) * minimapWrapper.offsetWidth;

  const dy = (p2.y - p1.y) * minimapWrapper.offsetHeight;

  const len = Math.sqrt(dx * dx + dy * dy);

  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  line.style.width = len + "px";

  line.style.left = p1.x * 100 + "%";

  line.style.top = p1.y * 100 + "%";

  line.style.transform = `rotate(${angle}deg)`;

  minimapWrapper.appendChild(line);
}

// ========================================
// GET CLICK POSITION
// ========================================

function getClickPoint(e) {
  const rect = minimapWrapper.getBoundingClientRect();

  return {
    x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),

    y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
  };
}

// ========================================
// CALCULATE SCORE
// ========================================

function calcScore(p1, p2) {
  const dx = p1.x - p2.x;

  const dy = p1.y - p2.y;

  const dist = Math.sqrt(dx * dx + dy * dy);

  const score = Math.max(0, Math.round(5000 * (1 - dist / Math.SQRT2)));

  return {
    score,
    dist,
  };
}

// ========================================
// LOAD LEVEL
// ========================================

function loadLevel(index) {
  const level = levels[index];

  currentIndex = index;

  guessPoint = null;
  correctPoint = level.correct;

  hasGuessed = false;
  answerLocked = false;

  currentRoundScore = 0;

  levelName.textContent = level.name;

  photoImg.src = level.photo;

  mapImg.src = level.map;

  clearMarkers();

  // Lock Answer disabled
  btnLock.disabled = true;

  btnLock.classList.remove("hidden");

  // Next disabled/hidden
  btnNext.classList.add("hidden");

  btnNext.disabled = true;

  btnNext.textContent =
    currentIndex < levels.length - 1 ? "Next Round →" : "See Final Result";

  setStatus(
    `
      Click on the <strong>minimap</strong>
      to choose your location.
      <br>
      <small>
        You can change your answer
        until you lock it.
      </small>
    `,
    "info",
  );
}

// ========================================
// MINIMAP CLICK
// ========================================

minimapWrapper.addEventListener("click", (e) => {
  // După Lock nu mai permitem modificarea
  if (answerLocked) {
    return;
  }

  // Salvăm noua poziție
  guessPoint = getClickPoint(e);

  hasGuessed = true;

  /*
   * Înainte de Lock NU afișăm:
   * - poziția corectă
   * - linia
   * - scorul
   * - distanța
   *
   * Arătăm doar poziția aleasă de player.
   */

  clearMarkers();

  addMarker(guessPoint, "guess");

  // Activăm Lock Answer
  btnLock.disabled = false;

  setStatus(
    `
        <strong>Location selected.</strong>
        <br>
        <small>
          Click the map again to change it,
          or lock your answer when ready.
        </small>
      `,
    "info",
  );
});

// ========================================
// LOCK ANSWER
// ========================================

btnLock.addEventListener("click", () => {
  // Nu putem face Lock fără un guess
  if (!hasGuessed || !guessPoint) {
    return;
  }

  // Blocăm răspunsul
  answerLocked = true;

  // Dezactivăm butonul Lock
  btnLock.disabled = true;

  btnLock.textContent = "🔒 Answer Locked";

  /*
   * Acum dezvăluim răspunsul corect.
   */

  clearMarkers();

  // Marker poziție corectă
  addMarker(correctPoint, "correct");

  // Marker poziție player
  addMarker(guessPoint, "guess");

  // Linie între cele două
  drawLine(correctPoint, guessPoint);

  // Calculăm scorul
  const { score, dist } = calcScore(correctPoint, guessPoint);

  currentRoundScore = score;

  // Adăugăm scorul o singură dată
  totalScore += currentRoundScore;

  totalScoreEl.textContent = totalScore;

  const distPct = (dist * 100).toFixed(1);

  // Determinăm tipul statusului
  const type = score >= 4000 ? "success" : score >= 2000 ? "info" : "error";

  /*
   * Acum afișăm rezultatul final al rundei.
   */

  setStatus(
    `
    <div class="result-title">
      Round Complete!
    </div>

    <div class="round-result">
      <span>
        Round Score:
        <strong>${score}</strong>
        / 5000
      </span>

      <span>
        Distance:
        <strong>${distPct}%</strong>
      </span>
    </div>

    <div class="answer-result">
      <span class="correct-dot"></span>
      Correct location
    </div>

    <div class="answer-result">
      <span class="guess-dot"></span>
      Your guess
    </div>
  `,
    type,
  );
  /*
   * Abia acum apare Next Round.
   */

  btnNext.classList.remove("hidden");

  btnNext.disabled = false;

  btnNext.textContent =
    currentIndex < levels.length - 1 ? "Next Round →" : "See Final Result";
});

// ========================================
// START GAME
// ========================================

document.getElementById("btnStart").addEventListener("click", () => {
  totalScore = 0;

  currentIndex = 0;

  currentRoundScore = 0;

  totalScoreEl.textContent = "0";

  showScreen(gameScreen);

  loadLevel(0);
});

// ========================================
// NEXT ROUND
// ========================================

btnNext.addEventListener("click", () => {
  if (currentIndex < levels.length - 1) {
    loadLevel(currentIndex + 1);

    return;
  }

  // ====================================
  // FINAL RESULT
  // ====================================

  finalScoreEl.textContent = totalScore;

  const maxPossible = levels.length * 5000;

  const percent = Math.round((totalScore / maxPossible) * 100);

  let msg = "";

  if (percent >= 85) {
    msg = "Excellent! Eagle eyes!";
  } else if (percent >= 60) {
    msg = "Very good! Almost perfect.";
  } else if (percent >= 40) {
    msg = "Decent. Keep practicing.";
  } else {
    msg = "Try again! You can do better.";
  }

  finalMessage.textContent = `${msg} (${percent}% of maximum)`;

  showScreen(finalScreen);
});

// ========================================
// REPLAY
// ========================================

document.getElementById("btnReplay").addEventListener("click", () => {
  currentIndex = 0;

  totalScore = 0;

  currentRoundScore = 0;

  guessPoint = null;

  correctPoint = null;

  hasGuessed = false;

  answerLocked = false;

  totalScoreEl.textContent = "0";

  btnLock.disabled = true;

  btnLock.textContent = "🔒 Lock Answer";

  btnNext.classList.add("hidden");

  btnNext.disabled = true;

  clearMarkers();

  showScreen(startScreen);
});
