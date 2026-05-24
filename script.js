const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  const item = document.createElement("li");
  item.className = "todo-item";

  const checkBtn = document.createElement("button");
  checkBtn.type = "button";
  checkBtn.className = "todo-check";
  checkBtn.setAttribute("aria-label", "标记完成");
  checkBtn.setAttribute("aria-pressed", "false");
  checkBtn.addEventListener("click", () => {
    const done = item.classList.toggle("completed");
    checkBtn.setAttribute("aria-pressed", String(done));
  });

  const span = document.createElement("span");
  span.className = "todo-text";
  span.textContent = text;

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "todo-delete";
  deleteBtn.textContent = "删除";
  deleteBtn.setAttribute("aria-label", "删除待办");
  deleteBtn.addEventListener("click", () => item.remove());

  item.append(checkBtn, span, deleteBtn);
  list.appendChild(item);
  input.value = "";
  input.focus();
});
