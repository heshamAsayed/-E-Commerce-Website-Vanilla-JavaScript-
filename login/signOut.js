import { auth } from '/firebase-config.js';
import { signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const logoutBtn = document.getElementById('logoutBtn');   // Front end button ID

logoutBtn.addEventListener('click', async () => {
  try {
    await signOut(auth);
    console.log('User logged out');
    // بعد تسجيل الخروج ارجع المستخدم لصفحة تسجيل الدخول
    window.location.href = '../login/login.html';
  } catch (error) {
    console.error('Logout error:', error.message);
  }
});
