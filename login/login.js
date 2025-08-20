import { auth, database } from '../firebase-config.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const loginForm = document.getElementById('loginForm');
const errorDiv = document.getElementById('error');
const submitBtn = document.getElementById('submit');


loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorDiv.textContent = '';

  const email = loginForm.email.value.trim();
  const password = loginForm.password.value.trim();

  if (!email || !password) {
    errorDiv.textContent = 'Please fill all fields.';
    return;
  }

  try {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading-spinner mx-2"></span> جاري التسجيل...';

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userRef = ref(database, 'users/' + user.uid);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      errorDiv.textContent = 'User data not found. Contact admin.';
      await auth.signOut();
      return;
    }

    const userData = snapshot.val();

    if (userData.type === 'admin') {
      window.location.href = '../admin_Dashbord.html';
    } else if (userData.type === 'customer') {
      window.location.href = '../User_Product.html';
    } else {
      errorDiv.textContent = 'User type is invalid.';
      await auth.signOut();
    }

  } catch (error) {
    errorDiv.textContent = error.message;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Login';
  }
});
