// استدعاء Firebase config
import { auth, database } from './firebase-config.js';

import { 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import { 
  ref as dbRef, 
  onValue, 
  push, 
  set, 
  remove, 
  get 
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

// اخفاء الصفحة مبدئيًا
// document.body.style.display = 'none';

// عناصر الـ DOM
const alertContainer = document.getElementById('alertContainer');
const  mainContent = document.getElementById('mainContent');

const categorySelect = document.getElementById('categorySelect');
const productForm = document.getElementById('productForm');
const productsTbody = document.getElementById('productsTbody');  // تأكد الاسم صح هنا
const saveBtn = document.getElementById('saveBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const logoutBtn = document.getElementById('logoutBtn');
const btnDashboardCats = document.getElementById('btn-dashboard-cats');

const productIdField = document.getElementById('productId');
const nameInput = document.getElementById('name');
const priceInput = document.getElementById('price');
const stockInput = document.getElementById('stock');
const descriptionInput = document.getElementById('description');
const imageURLInput = document.getElementById('imageURL');
mainContent.style.display = 'none'; // إخفاء المحتوى الرئيسي حتى يتم التحقق من تسجيل الدخول


let categoriesMap = {}; // id -> name

// دالة عرض تنبيه
function showAlert(msg, type='success') {
  alertContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${msg}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
  setTimeout(() => alertContainer.innerHTML = '', 3500);
}
function redirectToLogin() {
  window.location.href = './login/login.html';
}


// التحقق من تسجيل الدخول وصلاحية الأدمن
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    console.log("User not logged in");
    redirectToLogin();
    return;
  }
  try {
    const userSnap = await get(dbRef(database, 'users/' + user.uid));
    const ud = userSnap.exists() ? userSnap.val() : null;
    if (!ud || (ud.type !== 'admin' )) {
      alert('Access denied: admin only');
      redirectToLogin();
      return;
    }

    // المستخدم ادمن => إظهار الصفحة
    // document.body.style.display = 'block';
mainContent.style.display = 'block';
    // استمع للأقسام والمنتجات
    listenCategories();
    listenProducts();
  } catch (err) {
    console.error(err);
    alert('Auth check error');
    redirectToLogin();
  }
});

// تسجيل الخروج
logoutBtn?.addEventListener('click', async () => {
  await signOut(auth);

  redirectToLogin();
});

// الانتقال لصفحة الأقسام
btnDashboardCats?.addEventListener('click', () => {
  window.location.href = './admin-categories.html';
});

// جلب الأقسام
function listenCategories() {
  const categoriesRef = dbRef(database, 'categories');
  onValue(categoriesRef, (snap) => {
    categorySelect.innerHTML = `<option value="">-- Select category --</option>`;
    categoriesMap = {};
    snap.forEach(child => {
      const id = child.key;
      const data = child.val();
      const name = data.name || data.title || '';
      categoriesMap[id] = name;
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = name;
      categorySelect.appendChild(opt);
    });
    if (Object.keys(categoriesMap).length === 0) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'No categories';
      categorySelect.appendChild(opt);
    }
  }, err => console.error('categories onValue error', err));
}

// إضافة أو تعديل منتج
productForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = productIdField.value || null;
  const name = nameInput.value.trim();
  const price = Number(priceInput.value);
  const stock = Number(stockInput.value);
  const description = descriptionInput.value.trim();
  const categoryId = categorySelect.value;
  const categoryName = categoriesMap[categoryId] || '';
  const imageURL = imageURLInput.value.trim();

  if (!name || !categoryId || Number.isNaN(price) || Number.isNaN(stock) || !imageURL) {
    showAlert('Please fill required fields correctly and enter image URL', 'danger');
    return;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = id ? 'Updating...' : 'Saving...';

  try {
    const productData = {
      id: id || null,
      name,
      price,
      stock,
      description,
      categoryId,
      categoryName,
      imageURL
    };

    if (id) {
      await set(dbRef(database, 'products/' + id), productData);
      showAlert('Product updated', 'success');
    } else {
      const newRef = push(dbRef(database, 'products'));
      productData.id = newRef.key;
      await set(newRef, productData);
      showAlert('Product added', 'success');
    }

    productForm.reset();
    productIdField.value = '';
    cancelEditBtn.style.display = 'none';
    saveBtn.textContent = 'Add Product';
  } catch (err) {
    console.error(err);
    showAlert('Error saving product: ' + err.message, 'danger');
  } finally {
    saveBtn.disabled = false;
  }
});

// عرض المنتجات
function listenProducts() {
  const productsRef = dbRef(database, 'products');
  onValue(productsRef, (snap) => {
    productsTbody.innerHTML = '';
    snap.forEach(child => {
      const id = child.key;
      const p = child.val();
      const tr = document.createElement('tr');

      const imgHtml = p.imageURL ? `<img src="${p.imageURL}" class="thumb" alt=""/>` : '';

      tr.innerHTML = `
        <td>${imgHtml}</td>
        <td>${escapeHtml(p.name)}</td>
        <td>${Number(p.price).toFixed(2)}</td>
        <td>${p.stock ?? 0}</td>
        <td>${escapeHtml(p.categoryName || p.categoryId || '')}</td>
        <td>${escapeHtml(p.description || '')}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary me-1 edit-btn" data-id="${id}">Edit</button>
          <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${id}">Delete</button>
        </td>
      `;
      productsTbody.appendChild(tr);
    });

    document.querySelectorAll('.edit-btn').forEach(b => b.onclick = onEditClick);
    document.querySelectorAll('.delete-btn').forEach(b => b.onclick = onDeleteClick);
  }, err => console.error('products onValue error', err));
}

// تعديل منتج
async function onEditClick(e) {
  const id = e.target.dataset.id;
  try {
    const snap = await get(dbRef(database, 'products/' + id));
    if (!snap.exists()) {
      showAlert('Product not found', 'danger');
      return;
    }
    const p = snap.val();
    productIdField.value = id;
    nameInput.value = p.name || '';
    priceInput.value = p.price ?? '';
    stockInput.value = p.stock ?? '';
    descriptionInput.value = p.description || '';
    if (p.categoryId) categorySelect.value = p.categoryId;
    if (p.imageURL) imageURLInput.value = p.imageURL;
    cancelEditBtn.style.display = 'block';
    saveBtn.textContent = 'Update Product';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    console.error(err);
    showAlert('Error loading product: ' + err.message, 'danger');
  }
}

// حذف منتج
async function onDeleteClick(e) {
  const id = e.target.dataset.id;
  if (!confirm('Delete this product?')) return;
  try {
    await remove(dbRef(database, 'products/' + id));
    showAlert('Product deleted', 'success');
  } catch (err) {
    console.error(err);
    showAlert('Error deleting product: ' + err.message, 'danger');
  }
}

// إلغاء التعديل
cancelEditBtn.addEventListener('click', () => {
  productForm.reset();
  productIdField.value = '';
  cancelEditBtn.style.display = 'none';
  saveBtn.textContent = 'Add Product';
});

// حماية النصوص من الـ HTML injection
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
