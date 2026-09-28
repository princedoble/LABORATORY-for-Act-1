const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
const filterBtns = document.querySelectorAll(".filter-btn");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Render the task list based on the current filter
function render() {
  taskList.innerHTML = "";

  let visibleTasks = tasks;
  if (currentFilter === "active") {
    visibleTasks = tasks.filter(t => !t.completed);
  } else if (currentFilter === "completed") {
    visibleTasks = tasks.filter(t => t.completed);
  }

  if (visibleTasks.length === 0) {
    const msg = document.createElement("div");
    msg.classList.add("empty-message");
    msg.textContent = "No tasks here.";
    taskList.appendChild(msg);
  }

  visibleTasks.forEach(task => {
    const li = document.createElement("li");
    li.dataset.id = task.id;
    if (task.completed) li.classList.add("completed");

    const span = document.createElement("span");
    span.classList.add("task-text");
    span.textContent = task.text;

    // Toggle completed when clicking the text
    span.addEventListener("click", () => {
      if (span.isContentEditable) return; // don't toggle while editing
      task.completed = !task.completed;
      saveTasks();
      render();
    });

    const btnGroup = document.createElement("div");
    btnGroup.classList.add("task-buttons");

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.classList.add("edit-btn");

    editBtn.addEventListener("click", () => {
      const isEditing = span.isContentEditable;

      if (!isEditing) {
        // Enter edit mode
        span.contentEditable = "true";
        span.focus();
        placeCursorAtEnd(span);
        editBtn.textContent = "Save";
      } else {
        // Save edit
        finishEditing();
      }
    });

    function finishEditing() {
      span.contentEditable = "false";
      editBtn.textContent = "Edit";
      const newText = span.textContent.trim();
      task.text = newText === "" ? task.text : newText;
      span.textContent = task.text;
      saveTasks();
    }

    // Save edit on Enter, cancel-ish on blur
    span.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        finishEditing();
      }
    });

    span.addEventListener("blur", () => {
      if (span.isContentEditable) {
        finishEditing();
      }
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "X";
    deleteBtn.classList.add("delete-btn");

    deleteBtn.addEventListener("click", () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      render();
    });

    btnGroup.appendChild(editBtn);
    btnGroup.appendChild(deleteBtn);

    li.appendChild(span);
    li.appendChild(btnGroup);
    taskList.appendChild(li);
  });

  updateCount();
}

function placeCursorAtEnd(el) {
  const range = document.createRange();
  const sel = window.getSelection();
  range.selectNodeContents(el);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
}

function updateCount() {
  const activeCount = tasks.filter(t => !t.completed).length;
  taskCount.textContent = `${activeCount} task${activeCount === 1 ? "" : "s"} left`;
}

function addTask() {
  const text = taskInput.value.trim();
  if (text === "") {
    alert("Please type a task first!");
    return;
  }

  tasks.push({
    id: Date.now(),
    text: text,
    completed: false
  });

  saveTasks();
  render();

  taskInput.value = "";
  taskInput.focus();
}

addBtn.addEventListener("click", addTask);

taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addTask();
  }
});

clearCompletedBtn.addEventListener("click", () => {
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  render();
});

filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    render();
  });
});

// ---------- About Modal ----------
const aboutBtn = document.getElementById("aboutBtn");
const aboutModal = document.getElementById("aboutModal");
const closeAboutBtn = document.getElementById("closeAboutBtn");

function openAbout() {
  aboutModal.classList.remove("hidden");
}

function closeAbout() {
  aboutModal.classList.add("hidden");
}

aboutBtn.addEventListener("click", openAbout);
closeAboutBtn.addEventListener("click", closeAbout);

aboutModal.addEventListener("click", (e) => {
  if (e.target === aboutModal) closeAbout();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !aboutModal.classList.contains("hidden")) {
    closeAbout();
  }
});

// Initial render on page load
render();