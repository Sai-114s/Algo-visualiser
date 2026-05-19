
const sortingContainer = document.getElementById("sortingContainer");
const grid = document.getElementById("grid");

const GRID_ROWS = 7;
const GRID_COLS = 7;
const START_INDEX = 0;
const END_INDEX = GRID_ROWS * GRID_COLS - 1;

const algorithmSelect = document.getElementById("algorithmSelect");
const modeSelect = document.getElementById("modeSelect");
const sizeSlider = document.getElementById("size");
const speedSlider = document.getElementById("speed");

const generateBtn = document.getElementById("generateBtn");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const stopBtn = document.getElementById("stopBtn");

const comparisonsEl = document.getElementById("comparisons");
const swapsEl = document.getElementById("swaps");
const timeEl = document.getElementById("time");
const stepInfo = document.getElementById("stepInfo");
const description = document.getElementById("description");
const timeComplexity = document.getElementById("timeComplexity");
const spaceComplexity = document.getElementById("spaceComplexity");

let array = [];
let comparisons = 0;
let swaps = 0;
let startTime = 0;
let stopRequested = false;
let isRunning = false;

const sortingAlgorithms = {
  bubble: {
    name: "Bubble Sort",
    description: "Repeatedly swaps adjacent elements if they are in the wrong order.",
    time: "O(n²)",
    space: "O(1)"
  },
  merge: {
    name: "Merge Sort",
    description: "Divide-and-conquer sorting algorithm.",
    time: "O(n log n)",
    space: "O(n)"
  }
};

const pathfindingAlgorithms = {
  dijkstra: {
    name: "Dijkstra",
    description: "Finds shortest path using weighted graph traversal.",
    time: "O(V²)",
    space: "O(V)"
  },
  astar: {
    name: "A* Search",
    description: "Uses heuristics for faster shortest path finding.",
    time: "O(E)",
    space: "O(V)"
  }
};

function populateAlgorithms() {
  algorithmSelect.innerHTML = "";

  const source = modeSelect.value === "sorting"
    ? sortingAlgorithms
    : pathfindingAlgorithms;

  Object.keys(source).forEach(key => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = source[key].name;
    algorithmSelect.appendChild(option);
  });

  updateInfo();
}

function updateInfo() {
  const source = modeSelect.value === "sorting"
    ? sortingAlgorithms
    : pathfindingAlgorithms;

  const algo = source[algorithmSelect.value];

  description.textContent = algo.description;
  timeComplexity.textContent = algo.time;
  spaceComplexity.textContent = algo.space;
}

function randomArray(size) {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 400) + 20);
}

function renderArray() {
  sortingContainer.innerHTML = "";

  array.forEach(value => {
    const bar = document.createElement("div");
    bar.classList.add("bar");
    bar.style.height = `${value}px`;
    sortingContainer.appendChild(bar);
  });
}

function generateArray() {
  const size = sizeSlider.value;
  array = randomArray(size);
  renderArray();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getSortDelay() {
  return Math.max(150, 1200 - speedSlider.value * 8);
}

function getPathDelay() {
  return Math.max(30, 300 - speedSlider.value * 2);
}

function updateStats() {
  comparisonsEl.textContent = comparisons;
  swapsEl.textContent = swaps;
  timeEl.textContent = `${Date.now() - startTime} ms`;
}

async function bubbleSort() {
  const bars = document.querySelectorAll(".bar");

  for (let i = 0; i < array.length; i++) {
    if (stopRequested) return;
    for (let j = 0; j < array.length - i - 1; j++) {
      if (stopRequested) return;
      comparisons++;
      updateStats();

      bars[j].classList.add("active");
      bars[j + 1].classList.add("active");

      stepInfo.textContent = `Comparing index ${j} and ${j + 1}`;

      await sleep(getSortDelay());
      if (stopRequested) return;

      if (array[j] > array[j + 1]) {
        swaps++;

        [array[j], array[j + 1]] = [array[j + 1], array[j]];

        bars[j].style.height = `${array[j]}px`;
        bars[j + 1].style.height = `${array[j + 1]}px`;
      }

      bars[j].classList.remove("active");
      bars[j + 1].classList.remove("active");
    }

    bars[array.length - i - 1].classList.add("sorted");
  }
}

async function mergeSort(start, end) {
  if (stopRequested) return;
  if (start >= end) return;

  const mid = Math.floor((start + end) / 2);

  await mergeSort(start, mid);
  await mergeSort(mid + 1, end);
  await merge(start, mid, end);
}

async function merge(start, mid, end) {
  if (stopRequested) return;
  const bars = document.querySelectorAll(".bar");

  let left = array.slice(start, mid + 1);
  let right = array.slice(mid + 1, end + 1);

  let i = 0;
  let j = 0;
  let k = start;

  while (i < left.length && j < right.length) {
    if (stopRequested) return;
    comparisons++;
    updateStats();

    bars[k].classList.add("active");

    await sleep(getSortDelay());
    if (stopRequested) return;

    if (left[i] <= right[j]) {
      array[k] = left[i++];
    } else {
      array[k] = right[j++];
    }

    bars[k].style.height = `${array[k]}px`;
    bars[k].classList.remove("active");

    k++;
  }

  while (i < left.length) {
    if (stopRequested) return;
    array[k] = left[i++];
    bars[k].style.height = `${array[k]}px`;
    k++;
  }

  while (j < right.length) {
    if (stopRequested) return;
    array[k] = right[j++];
    bars[k].style.height = `${array[k]}px`;
    k++;
  }
}

function createGrid() {
  grid.innerHTML = "";

  for (let i = 0; i < GRID_ROWS * GRID_COLS; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");

    if (i === START_INDEX) cell.classList.add("start");
    if (i === END_INDEX) cell.classList.add("end");

    cell.addEventListener("click", () => {
      if (!cell.classList.contains("start") && !cell.classList.contains("end")) {
        cell.classList.toggle("wall");
      }
    });

    grid.appendChild(cell);
  }
}

function clearPathfindingState() {
  const cells = document.querySelectorAll(".cell");
  cells.forEach(cell => {
    cell.classList.remove("visited", "path");
  });
}

function getNeighbors(index) {
  const neighbors = [];
  const row = Math.floor(index / GRID_COLS);
  const col = index % GRID_COLS;

  if (row > 0) neighbors.push(index - GRID_COLS);
  if (row < GRID_ROWS - 1) neighbors.push(index + GRID_COLS);
  if (col > 0) neighbors.push(index - 1);
  if (col < GRID_COLS - 1) neighbors.push(index + 1);

  return neighbors;
}

function heuristic(a, b) {
  const aRow = Math.floor(a / GRID_COLS);
  const aCol = a % GRID_COLS;
  const bRow = Math.floor(b / GRID_COLS);
  const bCol = b % GRID_COLS;
  return Math.abs(aRow - bRow) + Math.abs(aCol - bCol);
}

async function runDijkstra() {
  const cells = document.querySelectorAll(".cell");
  const total = GRID_ROWS * GRID_COLS;
  const distances = Array(total).fill(Infinity);
  const previous = Array(total).fill(null);
  const visited = new Set();

  distances[START_INDEX] = 0;

  while (visited.size < total) {
    if (stopRequested) return;

    let current = null;
    let minDistance = Infinity;

    for (let i = 0; i < total; i++) {
      if (!visited.has(i) && distances[i] < minDistance) {
        minDistance = distances[i];
        current = i;
      }
    }

    if (current === null || minDistance === Infinity) break;
    if (cells[current].classList.contains("wall")) {
      visited.add(current);
      continue;
    }

    visited.add(current);

    if (current !== START_INDEX && current !== END_INDEX) {
      cells[current].classList.add("visited");
    }

    stepInfo.textContent = `Visiting node ${current}`;
    await sleep(getPathDelay());

    if (current === END_INDEX) break;

    const neighbors = getNeighbors(current);
    neighbors.forEach(neighbor => {
      if (visited.has(neighbor)) return;
      if (cells[neighbor].classList.contains("wall")) return;

      const alt = distances[current] + 1;
      if (alt < distances[neighbor]) {
        distances[neighbor] = alt;
        previous[neighbor] = current;
      }
    });
  }

  await drawPath(previous, cells);
}

async function runAStar() {
  const cells = document.querySelectorAll(".cell");
  const total = GRID_ROWS * GRID_COLS;
  const gScore = Array(total).fill(Infinity);
  const fScore = Array(total).fill(Infinity);
  const previous = Array(total).fill(null);
  const openSet = new Set([START_INDEX]);

  gScore[START_INDEX] = 0;
  fScore[START_INDEX] = heuristic(START_INDEX, END_INDEX);

  while (openSet.size > 0) {
    if (stopRequested) return;

    let current = null;
    let bestScore = Infinity;

    openSet.forEach(node => {
      if (fScore[node] < bestScore) {
        bestScore = fScore[node];
        current = node;
      }
    });

    if (current === null) break;
    if (current === END_INDEX) {
      await drawPath(previous, cells);
      return;
    }

    openSet.delete(current);

    if (current !== START_INDEX && current !== END_INDEX) {
      cells[current].classList.add("visited");
    }

    stepInfo.textContent = `Exploring node ${current}`;
    await sleep(getPathDelay());

    const neighbors = getNeighbors(current);
    neighbors.forEach(neighbor => {
      if (cells[neighbor].classList.contains("wall")) return;

      const tentativeG = gScore[current] + 1;
      if (tentativeG < gScore[neighbor]) {
        previous[neighbor] = current;
        gScore[neighbor] = tentativeG;
        fScore[neighbor] = tentativeG + heuristic(neighbor, END_INDEX);
        openSet.add(neighbor);
      }
    });
  }

  await drawPath(previous, cells);
}

async function drawPath(previous, cells) {
  const path = [];
  let current = END_INDEX;

  while (current !== null && current !== START_INDEX) {
    path.push(current);
    current = previous[current];
  }

  if (current === null) {
    stepInfo.textContent = "No path found.";
    return;
  }

  stepInfo.textContent = "Drawing shortest path.";

  for (let i = path.length - 1; i >= 0; i--) {
    if (stopRequested) return;
    const index = path[i];
    if (index !== END_INDEX) {
      cells[index].classList.add("path");
    }
    await sleep(getPathDelay() + 40);
  }
}

async function startVisualization() {
  if (isRunning) return;
  isRunning = true;
  stopRequested = false;
  comparisons = 0;
  swaps = 0;
  updateStats();

  startTime = Date.now();
  try {
    if (modeSelect.value === "sorting") {
      if (algorithmSelect.value === "bubble") {
        await bubbleSort();
      }

      if (algorithmSelect.value === "merge") {
        await mergeSort(0, array.length - 1);
      }
    } else {
      clearPathfindingState();
      if (algorithmSelect.value === "dijkstra") {
        await runDijkstra();
      }

      if (algorithmSelect.value === "astar") {
        await runAStar();
      }
    }
  } finally {
    isRunning = false;
    if (stopRequested) {
      stepInfo.textContent = "Stopped.";
    }
  }
}

modeSelect.addEventListener("change", () => {
  populateAlgorithms();

  if (modeSelect.value === "sorting") {
    sortingContainer.classList.remove("hidden");
    grid.classList.add("hidden");
  } else {
    sortingContainer.classList.add("hidden");
    grid.classList.remove("hidden");
  }
});

algorithmSelect.addEventListener("change", updateInfo);

generateBtn.addEventListener("click", () => {
  if (modeSelect.value === "sorting") {
    generateArray();
  } else {
    createGrid();
  }
});

startBtn.addEventListener("click", startVisualization);

resetBtn.addEventListener("click", () => {
  comparisons = 0;
  swaps = 0;
  updateStats();
  stepInfo.textContent = "Reset complete.";

  if (modeSelect.value === "sorting") {
    generateArray();
  } else {
    createGrid();
  }
});

stopBtn.addEventListener("click", () => {
  stopRequested = true;
});

populateAlgorithms();
generateArray();
createGrid();
