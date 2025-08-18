function changeTheme() {
    let link = document.getElementsByTagName("link")[0];
    let btn = document.getElementById("btn-theme");
    btn.href ="lightMode.css";
    console.log(link.href)
    if (link.href == location.origin+"/lightMode.css") {
      btn.innerHTML = "☀️";
      link.href = "darkMode.css";
    } else {
      btn.innerHTML = "🌙";
      link.href = "lightMode.css";
    }
  }

