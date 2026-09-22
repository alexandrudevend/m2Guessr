// ============================================
//  AICI EDITEZI RUNDLELE (foarte ușor)
//  x și y sunt între 0 și 1 (0 = stânga/sus, 1 = dreapta/jos)
// ============================================
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

// ===== STATE =====
let currentIndex = 0;
let totalScore = 0;
let hasGuessed = false;
let correctPoint = null;
let guessPoint = null;

// ===== DOM =====
const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const finalScreen = document.getElementById("finalScreen");

const progressText = document.getElementById("progressText");
const totalScoreEl = document.getElementById("totalScore");
const levelName = document.getElementById("levelName");
const photoImg = document.getElementById("photoImg");
const mapImg = document.getElementById("mapImg");
const minimapWrapper = document.getElementById("minimapWrapper");
const statusEl = document.getElementById("status");
const btnNext = document.getElementById("btnNext");
const finalScoreEl = document.getElementById("finalScore");
const finalMessage = document.getElementById("finalMessage");

// ===== HELPERS =====
function showScreen(screen) {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  screen.classList.add("active");
}

function setStatus(text, type = "info") {
  statusEl.innerHTML = text;
  statusEl.className = "status " + type;
}

function clearMarkers() {
  minimapWrapper
    .querySelectorAll(".marker, .line")
    .forEach((el) => el.remove());
}

function addMarker(point, cls) {
  const m = document.createElement("div");
  m.className = "marker " + cls;
  m.style.left = point.x * 100 + "%";
  m.style.top = point.y * 100 + "%";
  minimapWrapper.appendChild(m);
}

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

function getClickPoint(e) {
  const rect = minimapWrapper.getBoundingClientRect();
  return {
    x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
    y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
  };
}

function calcScore(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const score = Math.max(0, Math.round(5000 * (1 - dist / Math.SQRT2)));
  return { score, dist };
}

// ===== LOAD LEVEL =====
function loadLevel(index) {
  const level = levels[index];
  currentIndex = index;
  hasGuessed = false;
  correctPoint = level.correct;
  guessPoint = null;

  progressText.textContent = `Runda ${index + 1} / ${levels.length}`;
  levelName.textContent = level.name;
  photoImg.src = level.photo;
  mapImg.src = level.map;

  clearMarkers();
  btnNext.classList.add("hidden");
  btnNext.disabled = true;

  setStatus(
    "Click pe minimap ca să alegi locul unde crezi că a fost făcută poza.",
  );
}

// ===== CLICK PE MINIMAP =====
minimapWrapper.addEventListener("click", (e) => {
  if (hasGuessed) return;

  guessPoint = getClickPoint(e);
  hasGuessed = true;

  clearMarkers();
  addMarker(correctPoint, "correct");
  addMarker(guessPoint, "guess");
  drawLine(correctPoint, guessPoint);

  const { score, dist } = calcScore(correctPoint, guessPoint);
  totalScore += score;
  totalScoreEl.textContent = totalScore;

  const distPct = (dist * 100).toFixed(1);
  const type = score >= 4000 ? "success" : score >= 2000 ? "info" : "error";

  setStatus(
    `<span>Scor rundă: <strong>${score}</strong> / 5000 &nbsp;•&nbsp; Distanță: ${distPct}%</span>`,
    type,
  );

  btnNext.classList.remove("hidden");
  btnNext.disabled = false;
  btnNext.textContent =
    currentIndex < levels.length - 1
      ? "Următoarea rundă →"
      : "Vezi rezultatul final";
});

// ===== BUTOANE =====
document.getElementById("btnStart").addEventListener("click", () => {
  totalScore = 0;
  totalScoreEl.textContent = "0";
  showScreen(gameScreen);
  loadLevel(0);
});

btnNext.addEventListener("click", () => {
  if (currentIndex < levels.length - 1) {
    loadLevel(currentIndex + 1);
  } else {
    finalScoreEl.textContent = totalScore;
    const maxPossible = levels.length * 5000;
    const percent = Math.round((totalScore / maxPossible) * 100);

    let msg = "";
    if (percent >= 85) msg = "Excelent! Ai ochi de vultur.";
    else if (percent >= 60) msg = "Foarte bine! Aproape perfect.";
    else if (percent >= 40) msg = "Decent. Mai exersează puțin.";
    else msg = "Mai încearcă! Poți mai bine.";

    finalMessage.textContent = `${msg} (${percent}% din maxim)`;
    showScreen(finalScreen);
  }
});

document.getElementById("btnReplay").addEventListener("click", () => {
  showScreen(startScreen);
});
