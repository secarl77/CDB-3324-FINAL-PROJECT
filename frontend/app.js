// Update these if you change ports or hostnames
const AUTH_API = "http://localhost:5001/api";
const USER_API = "http://localhost:5000/api";

function setToken(t){ localStorage.setItem("token", t); }
function getToken(){ return localStorage.getItem("token"); }
function logout(){ localStorage.removeItem("token"); location.href = "/"; }

if (location.pathname.endsWith("/dashboard.html")) {
  const token = getToken();
  if (!token) { location = "/"; }
  document.getElementById("logout").onclick = logout;
  fetch(USER_API + "/users", { headers: { "Authorization": "Bearer " + token }})
    .then(r => r.json()).then(data => {
      const el = document.getElementById("users");
      if (Array.isArray(data)) {
        el.innerHTML = "<ul>" + data.map(u => `<li>${u.username} (${u.email})</li>`).join("") + "</ul>";
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
        if (data.token) { setToken(data.token); location = "/dashboard.html"; }
        else document.getElementById("message").innerText = data.message || JSON.stringify(data);
      });
  });
}

