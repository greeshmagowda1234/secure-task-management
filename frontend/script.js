const API_AUTH = "http://localhost:5000/auth";
const API_TASK = "http://localhost:5000/tasks";

let allTasks = [];

/*REGISTER*/
async function register() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Enter all fields");
    return;
  }

  const res = await fetch(API_AUTH + "/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    alert("Registration failed");
    return;
  }

  alert("Registered successfully");
  window.location.href = "login.html";
}

/*LOGIN*/
async function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPass").value;

  if (!email || !password) {
    alert("Enter all fields");
    return;
  }

  const res = await fetch(API_AUTH + "/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    alert("Invalid credentials");
    return;
  }

  const data = await res.json();
  localStorage.setItem("token", data.token);

  window.location.href = "tasks.html";
}

/*LOAD TASKS*/
async function loadTasks() {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  const res = await fetch(API_TASK, {
  headers: {
    Authorization: "Bearer " + token
  }
});

  allTasks = await res.json();

  renderTasks(allTasks);
  updateStats();
}

/*RENDER TASKS */
function renderTasks(tasks) {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  tasks.forEach(task => {
    const div = document.createElement("div");
    div.className = "task-item";

    div.innerHTML = `
      <div class="task-left">
        <input type="checkbox"
          ${task.completed ? "checked" : ""}
          onchange="toggleTask('${task._id}', this)">
        <span style="${task.completed ? 'text-decoration:line-through;opacity:0.5' : ''}">
          ${task.title}
        </span>
      </div>

      <button onclick="deleteTask('${task._id}')">🗑️</button>
    `;

    list.appendChild(div);
  });
}

/*ADD TASK*/
async function addTask() {
  const input = document.getElementById("taskInput");
  const token = localStorage.getItem("token");

  if (!input.value) {
    alert("Enter a task");
    return;
  }

  await fetch(API_TASK + "/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify({ title: input.value })
  });

  input.value = "";
  loadTasks();
}

/*DELETE TASK*/
async function deleteTask(id) {
  const token = localStorage.getItem("token");

  await fetch(API_TASK + "/" + id, {
    method: "DELETE",
    headers: { Authorization: token }
  });

  loadTasks();
}

/*TOGGLE COMPLETE*/
async function toggleTask(id, checkbox) {
  const token = localStorage.getItem("token");

  await fetch(API_TASK + "/" + id, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify({ completed: checkbox.checked })
  });

  loadTasks();
}

/* FILTER */
function showCompleted() {
  renderTasks(allTasks.filter(t => t.completed));
}

function showAll() {
  renderTasks(allTasks);
}

/*STATS*/
function updateStats() {
  const total = allTasks.length;
  const done = allTasks.filter(t => t.completed).length;

  document.getElementById("total").innerText = total;
  document.getElementById("done").innerText = done;
  document.getElementById("pending").innerText = total - done;
}

/*LOGOUT*/
function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

/*AUTO LOAD*/
if (window.location.pathname.includes("tasks.html")) {
  loadTasks();
}