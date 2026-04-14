// ==============================
// Simple Task Manager App
// ==============================

// Utility: Generate unique ID
function generateId() {
  return "_" + Math.random().toString(36).substr(2, 9);
}

// ==============================
// Task Class
// ==============================
class Task {
  constructor(title, completed = false) {
    this.id = generateId();
    this.title = title;
    this.completed = completed;
    this.createdAt = new Date();
  }

  toggle() {
    this.completed = !this.completed;
  }
}

// ==============================
// Task Manager
// ==============================
class TaskManager {
  constructor() {
    this.tasks = [];
    this.loadFromLocalStorage();
  }

  addTask(title) {
    const task = new Task(title);
    this.tasks.push(task);
    this.saveToLocalStorage();
    return task;
  }

  deleteTask(id) {
    this.tasks = this.tasks.filter((task) => task.id !== id);
    this.saveToLocalStorage();
  }

  toggleTask(id) {
    const task = this.tasks.find((task) => task.id === id);
    if (task) {
      task.toggle();
      this.saveToLocalStorage();
    }
  }

  getTasks() {
    return this.tasks;
  }

  saveToLocalStorage() {
    localStorage.setItem("tasks", JSON.stringify(this.tasks));
  }

  loadFromLocalStorage() {
    const data = localStorage.getItem("tasks");
    if (data) {
      const parsed = JSON.parse(data);
      this.tasks = parsed.map((t) => {
        const task = new Task(t.title, t.completed);
        task.id = t.id;
        task.createdAt = new Date(t.createdAt);
        return task;
      });
    }
  }
}

// ==============================
// UI Controller
// ==============================
class UI {
  constructor(taskManager) {
    this.taskManager = taskManager;
    this.taskList = document.getElementById("taskList");
    this.taskInput = document.getElementById("taskInput");
    this.addBtn = document.getElementById("addBtn");

    this.addBtn.addEventListener("click", () => this.handleAddTask());
    this.render();
  }

  handleAddTask() {
    const title = this.taskInput.value.trim();
    if (title === "") return;

    this.taskManager.addTask(title);
    this.taskInput.value = "";
    this.render();
  }

  handleDelete(id) {
    this.taskManager.deleteTask(id);
    this.render();
  }

  handleToggle(id) {
    this.taskManager.toggleTask(id);
    this.render();
  }

  createTaskElement(task) {
    const li = document.createElement("li");
    li.className = "task-item";

    const span = document.createElement("span");
    span.textContent = task.title;
    span.style.textDecoration = task.completed ? "line-through" : "none";

    const toggleBtn = document.createElement("button");
    toggleBtn.textContent = task.completed ? "Undo" : "Done";
    toggleBtn.onclick = () => this.handleToggle(task.id);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = () => this.handleDelete(task.id);

    li.appendChild(span);
    li.appendChild(toggleBtn);
    li.appendChild(deleteBtn);

    return li;
  }

  render() {
    this.taskList.innerHTML = "";
    const tasks = this.taskManager.getTasks();

    if (tasks.length === 0) {
      this.taskList.innerHTML = "<p>No tasks yet.</p>";
      return;
    }

    tasks.forEach((task) => {
      const taskElement = this.createTaskElement(task);
      this.taskList.appendChild(taskElement);
    });
  }
}

// ==============================
// API Example (Async/Await)
// ==============================
async function fetchRandomQuote() {
  const url = "https://api.quotable.io/random";

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Network error");

    const data = await response.json();
    console.log("Quote:", data.content);
  } catch (error) {
    console.error("Error fetching quote:", error);
  }
}

// ==============================
// Initialize App
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  const taskManager = new TaskManager();
  new UI(taskManager);

  // Fetch a quote on load
  fetchRandomQuote();
});

// ==============================
// Extra Utilities
// ==============================

// Debounce function
function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

// Example usage of debounce
window.addEventListener(
  "resize",
  debounce(() => {
    console.log("Window resized:", window.innerWidth);
  }, 300),
);

// Deep clone utility
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Example clone
const original = { a: 1, b: { c: 2 } };
const clone = deepClone(original);

console.log("Original:", original);
console.log("Clone:", clone);
