const exercises = [
  { id: 1, title: "Band External Rotation", prescription: "2 sets × 12–15 reps per side", description: "Keep your elbow bent 90 degrees and pinned to your side. Rotate your forearm outward from the shoulder, pause briefly, then return slowly with control." },
  { id: 2, title: "Face Pull", prescription: "2 sets × 10–15 reps", description: "Anchor the band at eye level. Pull toward your face with your elbows high, squeeze your shoulder blades, and externally rotate so your thumbs finish pointing behind you. Return slowly." },
  { id: 3, title: "Band Pull-Apart", prescription: "2 sets × 10–15 reps", description: "Hold the band at shoulder height with straight arms. Pull your hands apart by squeezing your shoulder blades, then return under control." },
  { id: 4, title: "Push-Up Plus", prescription: "2 sets × 10–15 reps", description: "Perform a controlled push-up. At the top, keep your elbows straight and push the floor away to spread your shoulder blades before returning." },
  { id: 5, title: "Serratus Wall Slide", prescription: "2 sets × 10–15 reps", description: "Keep your forearms against the wall and gently press outward. Slide your arms upward without shrugging, then lower with control." },
  { id: 6, title: "Resistance Band Row", prescription: "2 sets × 10–15 reps", description: "Sit or stand tall with the band anchored ahead. Draw your elbows back and squeeze your shoulder blades without leaning or shrugging." },
  { id: 7, title: "Band Lat Pulldown", prescription: "2 sets × 10–15 reps", description: "Sit tall with your legs extended and the band anchored overhead. Drive your elbows down and back toward your upper chest, squeeze your shoulder blades down, then return slowly." },
  { id: 8, title: "Band Chest Press", prescription: "2 sets × 10–15 reps", description: "Anchor the band behind you. Brace your trunk and press both hands forward until your arms are straight, then return slowly." },
  { id: 9, title: "Reverse Fly", prescription: "2 sets × 10–15 reps", description: "With arms nearly straight, pull the band apart and slightly backward. Keep your ribs down and avoid shrugging as you return." },
  { id: 10, title: "Pallof Press", prescription: "2 sets × 10–15 reps per side", description: "Stand sideways to the anchor. Press the band straight out from your chest while resisting rotation, pause, then bring it back in." },
  { id: 11, title: "Dead Bug", prescription: "2 sets × 6–10 reps per side", description: "Lie on your back with hips and knees bent. Keep your lower back gently pressed down as you extend the opposite arm and leg, then switch sides." },
  { id: 12, title: "Front Plank", prescription: "2 sets × 20–30 seconds", description: "Support yourself on forearms and toes. Keep a straight line from head to heels, brace your trunk, and breathe steadily without letting your hips sag." },
  { id: 13, title: "Side Plank", prescription: "2 sets × 15–30 seconds per side", description: "Support yourself on one forearm with your body in a straight line. Lift your hips, keep your shoulder stable, and breathe steadily." },
  { id: 14, title: "Squat", prescription: "2 sets × 10–15 reps", description: "Sit your hips down and back while your knees track over your toes. Keep your chest tall, then drive through your feet to stand." },
  { id: 15, title: "Romanian Deadlift", prescription: "2 sets × 10–15 reps", description: "Soften your knees and push your hips backward while keeping your spine neutral. Stop when you feel your hamstrings load, then stand tall." },
  { id: 16, title: "Monster Walk", prescription: "2 sets × 10–15 steps each way", description: "Keep tension on the band with hips and knees slightly bent. Take controlled diagonal steps while keeping your pelvis level and knees aligned." },
  { id: 17, title: "Reverse Lunge", prescription: "2 sets × 10–15 reps per side", description: "Step one foot backward and lower with control. Keep your front knee aligned over the foot, then push through the front leg to return." },
  { id: 18, title: "Glute Bridge", prescription: "2 sets × 10–15 reps", description: "Lie on your back with knees bent. Brace your trunk and squeeze your glutes to lift your hips without arching your lower back." },
  { id: 19, title: "Standing Calf Raise", prescription: "2 sets × 15–20 reps", description: "Stand tall and rise onto the balls of your feet. Pause at the top, then lower your heels slowly through a comfortable range." }
];

const exerciseById = new Map(exercises.map(exercise => [exercise.id, exercise]));
const workoutGroups = {
  serratus: [4, 5],
  pull: [6, 6, 6, 7, 7, 7, 2, 3, 9],
  core: [10, 11, 12, 13],
  knee: [14, 17],
  hinge: [15, 18],
  accessory: [16, 19]
};

function shuffle(values) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function drawFromBag(group) {
  const key = `strength-bag-${group}`;
  let bag;
  try { bag = JSON.parse(localStorage.getItem(key)); } catch { bag = null; }
  if (!Array.isArray(bag) || bag.length === 0) {
    const sequence = group === "pull"
      ? shuffle([2, 3, 9]).flatMap(accessory => shuffle([6, 7, accessory]))
      : shuffle(workoutGroups[group]);
    bag = sequence.reverse();
    const last = Number(localStorage.getItem(`${key}-last`));
    if (bag.length > 1 && bag[bag.length - 1] === last) {
      [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1], bag[0]];
    }
  }
  const selected = bag.pop();
  localStorage.setItem(key, JSON.stringify(bag));
  localStorage.setItem(`${key}-last`, selected);
  return selected;
}

function generateWorkout() {
  return {
    sessionId: Date.now(),
    ids: [1, drawFromBag("serratus"), drawFromBag("pull"), 8, drawFromBag("core"), drawFromBag("knee"), drawFromBag("hinge"), drawFromBag("accessory")]
  };
}

function readWorkout() {
  try {
    const saved = JSON.parse(localStorage.getItem("strength-current-workout"));
    if (saved && Number.isFinite(saved.sessionId) && Array.isArray(saved.ids) && saved.ids.length === 8 && saved.ids.every(id => exerciseById.has(id))) return saved;
  } catch {}
  const generated = generateWorkout();
  localStorage.setItem("strength-current-workout", JSON.stringify(generated));
  return generated;
}

let currentWorkout = readWorkout();
let workout = currentWorkout.ids.map(id => exerciseById.get(id));

const elements = {
  title: document.querySelector("#exercise-title"),
  prescription: document.querySelector("#exercise-prescription"),
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
  install: document.querySelector("#install-button"),
  workoutList: document.querySelector("#workout-list"),
  newWorkout: document.querySelector("#new-workout-button")
};

let currentIndex = Math.min(Math.max(Number(localStorage.getItem("currentExercise")) || 0, 0), workout.length - 1);
let timerFrame;
let wakeLock;
let installPrompt;
let state = readState(workout[currentIndex].id);

function stateKey(id) {
  return `strength-session-${currentWorkout.sessionId}-exercise-${id}`;
}

function readState(id) {
  try {
    return { elapsed: 0, startedAt: null, sets: 0, ...JSON.parse(localStorage.getItem(stateKey(id))) };
  } catch {
    return { elapsed: 0, startedAt: null, sets: 0 };
  }
}

function saveState() {
  localStorage.setItem(stateKey(workout[currentIndex].id), JSON.stringify(state));
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
  const exercise = workout[currentIndex];
  state = readState(exercise.id);
  localStorage.setItem("currentExercise", currentIndex);
  elements.title.textContent = exercise.title;
  elements.prescription.textContent = exercise.prescription;
  document.title = `${exercise.title} · Strength Session`;
  elements.description.textContent = exercise.description;
  elements.number.textContent = currentIndex + 1;
  elements.total.textContent = workout.length;
  elements.setCount.textContent = state.sets;
  elements.previous.disabled = currentIndex === 0;
  elements.next.disabled = currentIndex === workout.length - 1;
  elements.image.classList.remove("loaded");
  elements.loading.hidden = false;
  elements.image.src = `assets/positions/exercise-${exercise.id}.jpg`;
  elements.image.alt = `${exercise.title} start and finish positions`;
  setRunningUI(Boolean(state.startedAt));
  paintTimer();
  if (state.startedAt) requestWakeLock();
}

function renderWorkoutList() {
  elements.workoutList.replaceChildren(...workout.map((exercise, index) => {
    const details = document.createElement("details");
    details.className = "workout-item";
    const summary = document.createElement("summary");
    summary.innerHTML = `<span class="slot-number">${index + 1}</span><span><span class="item-title"></span><span class="item-rx"></span></span><svg class="chevron" aria-hidden="true" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>`;
    summary.querySelector(".item-title").textContent = exercise.title;
    summary.querySelector(".item-rx").textContent = exercise.prescription;
    const content = document.createElement("div");
    content.className = "workout-instructions";
    const instructions = document.createElement("p");
    instructions.textContent = exercise.description;
    const jump = document.createElement("button");
    jump.className = "jump-button";
    jump.type = "button";
    jump.textContent = "Open timer and position image";
    jump.addEventListener("click", () => {
      pauseTimer();
      currentIndex = index;
      renderExercise();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    content.append(instructions, jump);
    details.append(summary, content);
    return details;
  }));
}

function startNextWorkout() {
  if (!window.confirm("Finish this workout and generate the next eight exercises?")) return;
  pauseTimer();
  currentWorkout = generateWorkout();
  workout = currentWorkout.ids.map(id => exerciseById.get(id));
  localStorage.setItem("strength-current-workout", JSON.stringify(currentWorkout));
  currentIndex = 0;
  renderWorkoutList();
  renderExercise();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function moveExercise(direction) {
  pauseTimer();
  currentIndex = Math.min(Math.max(currentIndex + direction, 0), workout.length - 1);
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
elements.newWorkout.addEventListener("click", startNextWorkout);
elements.fullSheet.addEventListener("click", () => {
  const exercise = workout[currentIndex];
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

renderWorkoutList();
renderExercise();
