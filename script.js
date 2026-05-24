const STORAGE_KEY = "todoApp";

const app = document.querySelector(".app");
const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const btnToggleSelect = document.getElementById("btn-toggle-select");
const btnDeleteSelected = document.getElementById("btn-delete-selected");
const btnClearAll = document.getElementById("btn-clear-all");

let state = loadState();
let selectionMode = false;

function getToday() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDate(iso) {
  const [y, m, d] = iso.split("-");
  return `${y}年${Number(m)}月${Number(d)}日`;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { savedDate: getToday(), todos: [] };
    const data = JSON.parse(raw);
    return {
      savedDate: data.savedDate || getToday(),
      todos: Array.isArray(data.todos) ? data.todos : [],
    };
  } catch {
    return { savedDate: getToday(), todos: [] };
  }
}

function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ savedDate: state.savedDate, todos: state.todos })
  );
}

function createId() {
  return `todo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function setSelectionMode(on) {
  selectionMode = on;
  app.classList.toggle("selection-mode", on);
  btnToggleSelect.textContent = on ? "完成" : "批量管理";
  btnToggleSelect.setAttribute("aria-pressed", String(on));
  btnDeleteSelected.hidden = !on;

  if (!on) {
    list.querySelectorAll(".todo-select-input").forEach((cb) => {
      cb.checked = false;
      cb.closest(".todo-item")?.classList.remove("is-selected");
    });
  }

  updateToolbar();
}

function updateToolbar() {
  if (!selectionMode) return;
  const count = list.querySelectorAll(".todo-select-input:checked").length;
  btnDeleteSelected.disabled = count === 0;
  btnDeleteSelected.textContent =
    count > 0 ? `删除选中 (${count})` : "删除选中";
}

function renderAll() {
  list.replaceChildren();
  state.todos.forEach((todo) => list.appendChild(createTodoElement(todo)));
  setSelectionMode(selectionMode);
}

function createTodoElement(todo) {
  const item = document.createElement("li");
  item.className = "todo-item" + (todo.completed ? " completed" : "");
  item.dataset.id = todo.id;

  const selectLabel = document.createElement("label");
  selectLabel.className = "todo-select";
  selectLabel.title = "选中以便批量删除";

  const selectInput = document.createElement("input");
  selectInput.type = "checkbox";
  selectInput.className = "todo-select-input";
  selectInput.setAttribute("aria-label", "选中这条计划");
  selectInput.addEventListener("change", () => {
    item.classList.toggle("is-selected", selectInput.checked);
    updateToolbar();
  });

  selectLabel.appendChild(selectInput);

  const checkBtn = document.createElement("button");
  checkBtn.type = "button";
  checkBtn.className = "todo-check";
  checkBtn.setAttribute("aria-label", "标记完成");
  checkBtn.setAttribute("aria-pressed", String(todo.completed));
  checkBtn.addEventListener("click", () => {
    todo.completed = !todo.completed;
    item.classList.toggle("completed", todo.completed);
    checkBtn.setAttribute("aria-pressed", String(todo.completed));
    saveState();
  });

  const span = document.createElement("span");
  span.className = "todo-text";
  span.textContent = todo.text;

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "todo-delete";
  deleteBtn.textContent = "删除";
  deleteBtn.setAttribute("aria-label", "删除这条计划");
  deleteBtn.addEventListener("click", () => {
    state.todos = state.todos.filter((t) => t.id !== todo.id);
    saveState();
    item.remove();
    updateToolbar();
  });

  item.append(selectLabel, checkBtn, span, deleteBtn);
  return item;
}

function checkNewDay() {
  const today = getToday();

  if (!state.savedDate) {
    state.savedDate = today;
    saveState();
    return;
  }

  if (state.savedDate === today) return;

  if (state.todos.length === 0) {
    state.savedDate = today;
    saveState();
    return;
  }

  const ok = confirm(
    `上次计划保存在 ${formatDate(state.savedDate)}。\n\n是否清空旧计划，开始记录今天？\n\n确定：清空全部\n取消：保留旧计划`
  );
  if (ok) {
    state.todos = [];
    state.savedDate = today;
    saveState();
  }
}

function clearAllTodos() {
  if (state.todos.length === 0) return;
  if (!confirm("确定要清空全部计划吗？")) return;
  if (!confirm("再次确认：清空后无法恢复，是否继续？")) return;
  state.todos = [];
  state.savedDate = getToday();
  saveState();
  setSelectionMode(false);
  renderAll();
}

function deleteSelectedTodos() {
  const selectedIds = [
    ...list.querySelectorAll(".todo-select-input:checked"),
  ].map((el) => el.closest(".todo-item").dataset.id);

  if (selectedIds.length === 0) return;
  if (!confirm(`确定删除选中的 ${selectedIds.length} 条计划吗？`)) return;

  state.todos = state.todos.filter((t) => !selectedIds.includes(t.id));
  saveState();
  renderAll();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  const todo = { id: createId(), text, completed: false };
  state.todos.push(todo);
  if (!state.savedDate) state.savedDate = getToday();
  saveState();

  list.appendChild(createTodoElement(todo));
  input.value = "";
  input.focus();
  updateToolbar();
});

btnToggleSelect.addEventListener("click", () => setSelectionMode(!selectionMode));
btnClearAll.addEventListener("click", clearAllTodos);
btnDeleteSelected.addEventListener("click", deleteSelectedTodos);

checkNewDay();
renderAll();
