let savedTheme = localStorage.getItem("theme");
if (savedTheme !== null) {
  localStorage.setItem("theme", 0);
}
function changeTheme() {
  let link = document.getElementsByTagName("link")[0];
  let btn = document.getElementById("btn-theme");
  btn.href = "lightMode.css";
  if (localStorage.getItem("theme") == 0) {
    btn.innerHTML = "☀️";
    link.href = "darkMode.css";
    localStorage.setItem("theme",1);
  } else {
    ds = 0;
    localStorage.setItem("theme", 0);
    btn.innerHTML = "🌙";
    link.href = "lightMode.css";
  }
}
 window.onload = (changeTheme)
