const KEY = "tekichu-counter-v1";
const initial = { hits: 0, misses: 0, history: [] };
let state = load();

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && Number.isInteger(saved.hits) && Number.isInteger(saved.misses) && Array.isArray(saved.history)) {
      return saved;
    }
  } catch (_) {}
  return structuredClone(initial);
}
function save() {
  localStorage.setItem(KEY, JSON.stringify(state));
}
function add(kind) {
  if (kind === "hit") state.hits++;
  if (kind === "miss") state.misses++;
  state.history.push(kind);
  save();
  render();
}
function render() {
  const total = state.hits + state.misses;
  const rate = total ? (state.hits / total * 100).toFixed(1) : "0.0";
  document.getElementById("rate").textContent = `${rate}%`;
  document.getElementById("hitCount").textContent = `${state.hits}回`;
  document.getElementById("missCount").textContent = `${state.misses}回`;
  document.getElementById("total").textContent =
    `判定合計：${total}回　スキップ：${state.history.filter(x => x === "skip").length}回`;

  const history = document.getElementById("history");
  history.replaceChildren();
  const columns = Math.max(1, Math.ceil(state.history.length / 12));
  for (let col = 0; col < columns; col++) {
    const column = document.createElement("div");
    column.className = "history-col";
    for (let row = 0; row < 12; row++) {
      const item = state.history[col * 12 + row];
      const cell = document.createElement("div");
      cell.className = "cell";
      if (item === "hit") {
        cell.textContent = "〇";
        cell.classList.add("hit");
      } else if (item === "miss") {
        cell.textContent = "✕";
        cell.classList.add("miss");
      } else if (item === "skip") {
        cell.textContent = "－";
        cell.classList.add("skip");
      }
      column.appendChild(cell);
    }
    history.appendChild(column);
  }
}
document.getElementById("hit").addEventListener("click", () => add("hit"));
document.getElementById("miss").addEventListener("click", () => add("miss"));
document.getElementById("skip").addEventListener("click", () => add("skip"));
document.getElementById("reset").addEventListener("click", () => {
  if (!confirm("的中・外れの回数と履歴をすべて削除しますか？")) return;
  state = structuredClone(initial);
  save();
  render();
});
render();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}
