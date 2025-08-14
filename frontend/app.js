// ----------------------
// API Endpoints
// ----------------------
const AUTH_API = "http://localhost:5001/api"; // auth backend
const USER_API = "http://localhost:5000/api"; // users backend

// ----------------------
// Token Helpers
// ----------------------
function setToken(t) { localStorage.setItem("token", t); }
function getToken() { return localStorage.getItem("token"); }
function logout() { localStorage.removeItem("token"); location.href = "index.html"; }

// ----------------------
// Dashboard Functions
// ----------------------
function fetchUsers() {
  const token = getToken();
  if (!token) return logout();

  fetch(USER_API + "/users", { headers: { "Authorization": "Bearer " + token }})
    .then(r => r.json())
    .then(data => showUsers(data))
    .catch(err => console.error("Error fetching users:", err));
}

function showUsers(data) {
  const el = document.getElementById("users");
  if (!Array.isArray(data)) { el.innerText = JSON.stringify(data); return; }

  el.innerHTML = `
    <table border="1" cellspacing="0" cellpadding="8">
      <thead style="background:#007bff; color:white;">
        <tr>
          <th>ID</th><th>Username</th><th>Email</th><th>Role</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${data.map(u => `
          <tr>
            <td>${u.id}</td>
            <td>${u.username}</td>
            <td>${u.email}</td>
            <td>${u.role || "N/A"}</td>
            <td>
              <a href="/add_user.html?id=${u.id}">Edit</a>
              <button onclick="deleteUser(${u.id})">Delete</button>
            </td>
          </tr>`).join("")}
      </tbody>
    </table>`;
}

function deleteUser(id) {
  const token = getToken();
  if (!token) return logout();

  if (!confirm("Are you sure you want to delete user ID " + id + "?")) return;

  fetch(USER_API + `/users/${id}`, {
    method: "DELETE",
    headers: { 'Authorization': 'Bearer ' + token }
  })
  .then(r => r.json())
  .then(() => fetchUsers())
  .catch(err => console.error("Error deleting user:", err));
}

window.deleteUser = deleteUser;

// ----------------------
// Add/Edit User Functions
// ----------------------
function loadUserData(userId, form) {
  const token = getToken();
  if (!token) return logout();

  fetch(USER_API + "/users", { headers: { "Authorization": "Bearer " + token }})
    .then(r => r.json())
    .then(data => {
      const user = data.find(u => u.id == userId);
      if (!user) return alert("User not found");
      form.username.value = user.username;
      form.email.value = user.email;
      if (user.role) form.role.value = user.role;
    })
    .catch(err => console.error("Error loading user:", err));
}

function saveUser(userId, form) {
  const token = getToken();
  if (!token) return logout();

  const fd = new FormData(form);
  const payload = { username: fd.get("username"), email: fd.get("email") };
  const password = fd.get("password");
  if (password) payload.password = password;
  const role = fd.get("role");
  if (role) payload.role = role;

  let url = USER_API + "/users";
  let method = "POST";
  if (userId) { url += `/${userId}`; method = "PUT"; }

  fetch(url, {
    method: method,
    headers: { "Content-Type":"application/json", "Authorization":"Bearer " + token },
    body: JSON.stringify(payload)
  })
  .then(r => r.json())
  .then(data => {
    if (data.message) alert(data.message);
    else {
      alert(userId ? "User updated successfully!" : "User added successfully!");
      location.href = "dashboard.html";
    }
  })
  .catch(err => console.error("Error saving user:", err));
}

// ----------------------
// Main Page Logic
// ----------------------
document.addEventListener("DOMContentLoaded", () => {

  // ---------- LOGIN ----------
  if (document.getElementById("loginForm")) {
    document.getElementById("loginForm").addEventListener("submit", e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const payload = { username: fd.get("username"), password: fd.get("password") };

      fetch(AUTH_API + "/login", {
        method: "POST",
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify(payload)
      })
      .then(r => r.json())
      .then(data => {
        if (data.token) {
          setToken(data.token);
          localStorage.setItem("username", data.username);
          location.href = "dashboard.html";
        } else {
          document.getElementById("message").innerText = data.message || JSON.stringify(data);
        }
      })
      .catch(err => console.error("Login error:", err));
    });
  }

  // ---------- DASHBOARD ----------
  if (document.getElementById("users")) {
    const token = getToken();
    if (!token) return logout();

    const username = localStorage.getItem("username");
    if (username) document.getElementById("welcome").innerText = "Welcome, " + username.toUpperCase();

    const logoutBtn = document.getElementById("logout");
    if (logoutBtn) logoutBtn.onclick = logout;

    fetchUsers();
  }

  // ---------- ADD / EDIT USER ----------
  if (document.getElementById("userForm")) {
    const form = document.getElementById("userForm");
    const userId = new URLSearchParams(window.location.search).get("id");
    const title = document.getElementById("formTitle");

    if (userId) {
      title.innerText = "Edit User";
      loadUserData(userId, form);
    } else {
      title.innerText = "Add New User";
    }

    form.addEventListener("submit", e => {
      e.preventDefault();
      saveUser(userId, form);
    });
  }

});
