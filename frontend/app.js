// Update these if you change ports or hostnames
const AUTH_API = "http://localhost:5001/api";
const USER_API = "http://localhost:5000/api";

// --------------------
// Token and Auth Utils
// --------------------
function setToken(t){ localStorage.setItem("token", t); }
function getToken(){ return localStorage.getItem("token"); }
function logout(){ localStorage.removeItem("token"); location.href = "/"; }

// --------------------
// DOMContentLoaded
// --------------------
document.addEventListener("DOMContentLoaded", () => {

  // --- LOGIN PAGE ---
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const payload = { username: fd.get("username"), password: fd.get("password") };
      fetch(AUTH_API + "/login", {
        method: "POST",
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      })
      .then(r => r.json())
      .then(data => {
        if (data.token) {
          setToken(data.token);
          localStorage.setItem("username", data.username);
          location.href = "/dashboard.html";
        } else {
          document.getElementById("message").innerText = data.message || JSON.stringify(data);
        }
      });
    });
    return;
  }

  // --- DASHBOARD PAGE ---
  if (location.pathname.endsWith("/dashboard.html")) {
    const token = getToken();
    const username = localStorage.getItem("username");
    if (!token) return logout();

    document.getElementById("logout").onclick = logout;
    if (username) document.getElementById("welcome").innerText = "Welcome, " + username.toUpperCase();

    fetch(USER_API + "/users", { headers: { "Authorization": "Bearer " + token }})
      .then(r => r.json())
      .then(data => {
        const el = document.getElementById("users");
        if (!Array.isArray(data)) return el.innerText = JSON.stringify(data);

        let table = `
          <table border="1" cellspacing="0" cellpadding="8">
            <thead style="background:#007bff; color:white;">
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${data.map(u => `
                <tr>
                  <td>${u.id}</td>
                  <td>${u.username}</td>
                  <td>${u.email}</td>
                  <td>${u.role || ''}</td>
                  <td>
                    <a href="/add_user.html?id=${u.id}">Edit</a>
                    <button onclick="deleteUser(${u.id})">Delete</button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        `;
        el.innerHTML = table;
      });
    return;
  }

  // --- ADD / EDIT USER PAGE ---
  const form = document.getElementById("userForm");
  if (!form) return;

  const userId = new URLSearchParams(window.location.search).get("id");
  const title = document.getElementById("formTitle");
  const submitBtn = document.getElementById("submitBtn");

  if (userId) {
    title.innerText = "Edit User";
    submitBtn.innerText = "Update User";
    loadUserData(userId, form);
  } else {
    title.innerText = "Add New User";
    submitBtn.innerText = "Add User";
  }

  form.addEventListener("submit", e => {
    e.preventDefault();
    saveUser(userId, form);
  });
});

// --------------------
// Functions: Load / Save / Delete
// --------------------
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
  if (fd.get("password")) payload.password = fd.get("password");
  if (fd.get("role")) payload.role = fd.get("role");

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

function deleteUser(userId) {
  const token = getToken();
  if (!token) return logout();

  if (!confirm("Are you sure you want to delete this user?")) return;

  fetch(USER_API + "/users/" + userId, {
    method: "DELETE",
    headers: { "Authorization":"Bearer " + token }
  })
  .then(r => r.json())
  .then(data => {
    alert(data.message);
    location.reload();
  })
  .catch(err => console.error("Error deleting user:", err));
}
window.deleteUser = deleteUser;
