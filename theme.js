let savedTheme = localStorage.getItem("theme") || 0;

function applyTheme(theme) {
  let link = document.getElementsByTagName("link")[0];
  let btn = document.getElementById("btn-theme");

  if (theme == 0) {
    btn.innerHTML = "🌙";
    link.href = "lightMode.css";
  } else {
    btn.innerHTML = "☀️";
    link.href = "darkMode.css";
  }
}

function changeTheme() {
  let currentTheme = localStorage.getItem("theme") || 0;
  let newTheme = currentTheme == 0 ? 1 : 0;
  localStorage.setItem("theme", newTheme);
  applyTheme(newTheme);
}


window.onload = () => {
  applyTheme(savedTheme);
};
