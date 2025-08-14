// Update these if you change ports or hostnames
const AUTH_API = "http://localhost:5001/api";
const USER_API = "http://localhost:5000/api";

function setToken(t){ localStorage.setItem("token", t); }
function getToken(){ return localStorage.getItem("token"); }
function logout(){ localStorage.removeItem("token"); location.href = "/"; }

if (location.pathname.endsWith("/dashboard.html")) {
  const token = getToken();
  const username = localStorage.getItem("username");

  if (!token) { location = "/"; }
  document.getElementById("logout").onclick = logout;

  if (username) {
    document.getElementById("welcome").innerText = "Welcome, " + username.toUpperCase();

  }

  fetch(USER_API + "/users", { headers: { "Authorization": "Bearer " + token }})
    .then(r => r.json()).then(data => {
      const el = document.getElementById("users");
      if (Array.isArray(data)) {
        //el.innerHTML = "<ul>" + data.map(u => `<li>${u.username} (${u.email})</li>`).join("") + "</ul>";
        let table = `
          <table border="1" cellspacing="0" cellpadding="8">
            <thead style="background:#007bff; color:white;">
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${data.map(u => `
                <tr>
                  <td>${u.id}</td>
                  <td>${u.username}</td>
                  <td>${u.email}</td>
                  <td>
                    <a href="/edit.html?id=${u.id}">Edit</a>
                    <button onclick="deleteUser(${u.id})">Delete</button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        `;
        el.innerHTML = table;
      } else {
        el.innerText = JSON.stringify(data);
      }
    });
} else {
  document.getElementById("loginForm").addEventListener("submit", e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = { username: fd.get("username"), password: fd.get("password") };
    fetch(AUTH_API + "/login", { method: "POST", headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) })
      .then(r => r.json()).then(data => {
      console.log(data);
        if (data.token) {setToken(data.token); localStorage.setItem("username", data.username); location = "/dashboard.html"; }

        else document.getElementById("message").innerText = data.message || JSON.stringify(data);
      });
  });
}

