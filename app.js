const exercises = [
  { id: 1, title: "Band External Rotation", description: "Keep your elbow bent 90 degrees and pinned to your side. Rotate your forearm outward from the shoulder, pause briefly, then return slowly with control." },
  { id: 2, title: "Freestyle Pull", description: "Anchor the band overhead. Keep a high elbow and pull through the stroke path while your torso stays tall and still. Return slowly." },
  { id: 3, title: "Band Pull-Apart", description: "Hold the band at shoulder height with straight arms. Pull your hands apart by squeezing your shoulder blades, then return under control." },
  { id: 4, title: "Push-Up Plus", description: "Perform a controlled push-up. At the top, keep your elbows straight and push the floor away to spread your shoulder blades before returning." },
  { id: 5, title: "Serratus Wall Slide", description: "Keep your forearms against the wall and gently press outward. Slide your arms upward without shrugging, then lower with control." },
  { id: 6, title: "Resistance Band Row", description: "Sit or stand tall with the band anchored ahead. Draw your elbows back and squeeze your shoulder blades without leaning or shrugging." },
  { id: 7, title: "Band Lat Pulldown", description: "Sit tall with your legs extended and the band anchored overhead. Drive your elbows down and back toward your upper chest, squeeze your shoulder blades down, then return slowly." },
  { id: 8, title: "Band Chest Press", description: "Anchor the band behind you. Brace your trunk and press both hands forward until your arms are straight, then return slowly." },
  { id: 9, title: "Reverse Fly", description: "With arms nearly straight, pull the band apart and slightly backward. Keep your ribs down and avoid shrugging as you return." },
  { id: 10, title: "Pallof Press", description: "Stand sideways to the anchor. Press the band straight out from your chest while resisting rotation, pause, then bring it back in." },
  { id: 11, title: "Dead Bug", description: "Lie on your back with hips and knees bent. Keep your lower back gently pressed down as you extend the opposite arm and leg, then switch sides." },
  { id: 12, title: "Front Plank", description: "Support yourself on forearms and toes. Keep a straight line from head to heels, brace your trunk, and breathe steadily without letting your hips sag." },
  { id: 13, title: "Side Plank", description: "Support yourself on one forearm with your body in a straight line. Lift your hips, keep your shoulder stable, and breathe steadily." },
  { id: 14, title: "Squat", description: "Sit your hips down and back while your knees track over your toes. Keep your chest tall, then drive through your feet to stand." },
  { id: 15, title: "Romanian Deadlift", description: "Soften your knees and push your hips backward while keeping your spine neutral. Stop when you feel your hamstrings load, then stand tall." },
  { id: 16, title: "Monster Walk", description: "Keep tension on the band with hips and knees slightly bent. Take controlled diagonal steps while keeping your pelvis level and knees aligned." },
  { id: 17, title: "Reverse Lunge", description: "Step one foot backward and lower with control. Keep your front knee aligned over the foot, then push through the front leg to return." },
  { id: 18, title: "Glute Bridge", description: "Lie on your back with knees bent. Brace your trunk and squeeze your glutes to lift your hips without arching your lower back." },
  { id: 19, title: "Standing Calf Raise", description: "Stand tall and rise onto the balls of your feet. Pause at the top, then lower your heels slowly through a comfortable range." }
];

const elements = {
  title: document.querySelector("#exercise-title"),
  image: document.querySelector("#position-image"),
  loading: document.querySelector("#image-loading"),
  timer: document.querySelector("#timer"),
  start: document.querySelector("#start-button"),
  startText: document.querySelector("#start-button span"),
  reset: document.querySelector("#reset-button"),
  setMinus: document.querySelector("#set-minus"),
  setPlus: document.querySelector("#set-plus"),
  setCount: document.querySelector("#set-count"),
  description: document.querySelector("#exercise-description"),
  previous: document.querySelector("#previous-button"),
  next: document.querySelector("#next-button"),
  number: document.querySelector("#exercise-number"),
  total: document.querySelector("#exercise-total"),
  fullSheet: document.querySelector("#full-sheet-button"),
  dialog: document.querySelector("#sheet-dialog"),
  dialogTitle: document.querySelector("#sheet-title"),
  dialogImage: document.querySelector("#full-sheet-image"),
  closeDialog: document.querySelector("#close-dialog"),
  install: document.querySelector("#install-button")
};

let currentIndex = Math.min(Math.max(Number(localStorage.getItem("currentExercise")) || 0, 0), exercises.length - 1);
let timerFrame;
let wakeLock;
let installPrompt;
let state = readState(exercises[currentIndex].id);

function stateKey(id) {
  return `strength-exercise-${id}`;
}

function readState(id) {
  try {
    return { elapsed: 0, startedAt: null, sets: 0, ...JSON.parse(localStorage.getItem(stateKey(id))) };
  } catch {
    return { elapsed: 0, startedAt: null, sets: 0 };
  }
}

function saveState() {
  localStorage.setItem(stateKey(exercises[currentIndex].id), JSON.stringify(state));
}

function elapsedMilliseconds() {
  return state.elapsed + (state.startedAt ? Date.now() - state.startedAt : 0);
}

function formatTime(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours > 0
    ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function paintTimer() {
  elements.timer.value = formatTime(elapsedMilliseconds());
  if (state.startedAt) timerFrame = requestAnimationFrame(paintTimer);
}

async function requestWakeLock() {
  if (!("wakeLock" in navigator) || document.visibilityState !== "visible") return;
  try { wakeLock = await navigator.wakeLock.request("screen"); } catch { wakeLock = null; }
}

function releaseWakeLock() {
  if (wakeLock) wakeLock.release().catch(() => {});
  wakeLock = null;
}

function setRunningUI(running) {
  elements.start.classList.toggle("running", running);
  elements.startText.textContent = running ? "Pause" : (state.elapsed ? "Resume" : "Start");
}

function pauseTimer() {
  if (!state.startedAt) return;
  state.elapsed += Date.now() - state.startedAt;
  state.startedAt = null;
  cancelAnimationFrame(timerFrame);
  saveState();
  setRunningUI(false);
  paintTimer();
  releaseWakeLock();
}

function toggleTimer() {
  if (state.startedAt) {
    pauseTimer();
  } else {
    state.startedAt = Date.now();
    saveState();
    setRunningUI(true);
    paintTimer();
    requestWakeLock();
  }
}

function resetTimer() {
  if (elapsedMilliseconds() === 0 || !window.confirm("Reset the timer for this exercise?")) return;
  state.elapsed = 0;
  state.startedAt = null;
  saveState();
  cancelAnimationFrame(timerFrame);
  releaseWakeLock();
  setRunningUI(false);
  paintTimer();
}

function renderExercise() {
  const exercise = exercises[currentIndex];
  state = readState(exercise.id);
  localStorage.setItem("currentExercise", currentIndex);
  elements.title.textContent = exercise.title;
  document.title = `${exercise.title} · Strength Session`;
  elements.description.textContent = exercise.description;
  elements.number.textContent = currentIndex + 1;
  elements.total.textContent = exercises.length;
  elements.setCount.textContent = state.sets;
  elements.previous.disabled = currentIndex === 0;
  elements.next.disabled = currentIndex === exercises.length - 1;
  elements.image.classList.remove("loaded");
  elements.loading.hidden = false;
  elements.image.src = `assets/positions/exercise-${exercise.id}.jpg`;
  elements.image.alt = `${exercise.title} start and finish positions`;
  setRunningUI(Boolean(state.startedAt));
  paintTimer();
  if (state.startedAt) requestWakeLock();
}

function moveExercise(direction) {
  pauseTimer();
  currentIndex = Math.min(Math.max(currentIndex + direction, 0), exercises.length - 1);
  renderExercise();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function changeSets(amount) {
  state.sets = Math.min(Math.max(state.sets + amount, 0), 99);
  elements.setCount.textContent = state.sets;
  saveState();
}

elements.image.addEventListener("load", () => {
  elements.image.classList.add("loaded");
  elements.loading.hidden = true;
});
elements.start.addEventListener("click", toggleTimer);
elements.reset.addEventListener("click", resetTimer);
elements.previous.addEventListener("click", () => moveExercise(-1));
elements.next.addEventListener("click", () => moveExercise(1));
elements.setMinus.addEventListener("click", () => changeSets(-1));
elements.setPlus.addEventListener("click", () => changeSets(1));
elements.fullSheet.addEventListener("click", () => {
  const exercise = exercises[currentIndex];
  elements.dialogTitle.textContent = exercise.title;
  elements.dialogImage.src = `Exercise_${exercise.id}.png`;
  elements.dialogImage.alt = `Complete ${exercise.title} exercise sheet`;
  elements.dialog.showModal();
});
elements.closeDialog.addEventListener("click", () => elements.dialog.close());
elements.dialog.addEventListener("click", event => {
  if (event.target === elements.dialog) elements.dialog.close();
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && state.startedAt) {
    paintTimer();
    requestWakeLock();
  }
});

window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  installPrompt = event;
  elements.install.hidden = false;
});

elements.install.addEventListener("click", async () => {
  if (!installPrompt) return;
  installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = null;
  elements.install.hidden = true;
});

window.addEventListener("appinstalled", () => { elements.install.hidden = true; });
window.addEventListener("beforeunload", saveState);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js"));
}

renderExercise();
