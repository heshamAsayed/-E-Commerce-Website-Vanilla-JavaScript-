import { auth, database } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { ref, push, onValue, remove, set } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const categoryForm = document.getElementById('categoryForm');
const categoryNameInput = document.getElementById('categoryName');
const categoriesTableBody = document.getElementById('categoriesTableBody');
const alertContainer = document.getElementById('alertContainer');

function showAlert(message, type = 'success') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
  alertDiv.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  alertContainer.appendChild(alertDiv);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.remove();
    }
  }, 5000);
}

function redirectToLogin() {
  showAlert('يجب أن تكون مدير للوصول إلى هذه الصفحة', 'danger');
  setTimeout(() => {
    window.location.href = './login/login.html';
  }, 2000);
}

// حماية الصفحة: تأكد إن المستخدم مسجل دخول وهو أدمن
onAuthStateChanged(auth, (user) => {
  if (user) {
    const userRef = ref(database, 'users/' + user.uid);
    onValue(userRef, (snapshot) => {    // live listner
      const userData = snapshot.val();
      if (!userData || userData.type !== 'admin') {
        redirectToLogin();
      } else {
        console.log('مرحباً بالمدير!');
        showAlert('مرحباً بك في لوحة إدارة الأقسام', 'success');
        startCategoryManagement();
      }
    });
  } else {
    redirectToLogin();
  }
});

function startCategoryManagement() {
  // إضافة قسم جديد
  categoryForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // to prevent refresh
    const name = categoryNameInput.value.trim();
    if (!name) {
      showAlert('يرجى إدخال اسم القسم', 'warning');
      return;
    }

    try {
      const categoriesRef = ref(database, 'categories');
      const newCategoryRef = push(categoriesRef); // يولد مفتاح جديد to no overload in exist Data 
      await set(newCategoryRef, { name });
      categoryNameInput.value = '';
      showAlert('تم إضافة القسم بنجاح! 🎉', 'success');
      
      // Button animation
      const submitBtn = categoryForm.querySelector('button[type="submit"]');
      submitBtn.innerHTML = '<i class="fas fa-check me-2"></i>تم الإضافة';
      submitBtn.style.background = 'linear-gradient(45deg, #198754, #20c997)';
      setTimeout(() => {
        submitBtn.innerHTML = '<i class="fas fa-plus me-2"></i>إضافة قسم';
        submitBtn.style.background = 'linear-gradient(45deg, #667eea, #764ba2)';
      }, 2000);
    } catch (error) {
      showAlert('خطأ في إضافة القسم: ' + error.message, 'danger');
    }
  });

  // عرض الأقسام وتحديث الجدول تلقائيًا
  const categoriesRef = ref(database, 'categories');
  onValue(categoriesRef, (snapshot) => {   //زى اوبت بارام
    categoriesTableBody.innerHTML = '';
    
    if (!snapshot.exists()) {
      categoriesTableBody.innerHTML = `
        <tr>
          <td colspan="3">
            <div class="empty-state">
              <i class="fas fa-tags"></i>
              <p>لا توجد أقسام حالياً</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    const categories = [];
    snapshot.forEach((childSnapshot) => {
      categories.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });

    // Sort categories by name
    categories.sort((a, b) => a.name.localeCompare(b.name, 'ar'));

    categories.forEach((category, index) => {
      const tr = document.createElement('tr');
      tr.style.animationDelay = `${index * 0.1}s`;
      tr.innerHTML = `
        <td><span class="category-id">${category.id}</span></td>
        <td class="category-name">${category.name}</td>
        <td>
          <button class="btn btn-warning btn-sm edit-btn" data-id="${category.id}" data-name="${category.name}">
            <i class="fas fa-edit me-1"></i>تعديل
          </button>
          <button class="btn btn-danger btn-sm delete-btn" data-id="${category.id}">
            <i class="fas fa-trash me-1"></i>حذف
          </button>
        </td>
      `;
      categoriesTableBody.appendChild(tr);
    });

    // حدث تعديل الأقسام
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.closest('.edit-btn').dataset.id;
        const currentName = e.target.closest('.edit-btn').dataset.name;
        const newName = prompt('أدخل الاسم الجديد للقسم:', currentName);
        
        if (newName && newName.trim() && newName !== currentName) {
          try {
            await set(ref(database, 'categories/' + id), { name: newName.trim() });
            showAlert('تم تحديث القسم بنجاح! ✨', 'success');
          } catch (error) {
            showAlert('خطأ في تحديث القسم: ' + error.message, 'danger');
          }
        }
      });
    });

    // حدث حذف الأقسام
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.closest('.delete-btn').dataset.id;
        const categoryName = e.target.closest('tr').querySelector('.category-name').textContent;
        
        if (confirm(`هل أنت متأكد من حذف القسم "${categoryName}"؟ هذا الإجراء لا يمكن التراجع عنه.`)) {
          try {
            await remove(ref(database, 'categories/' + id));
            showAlert('تم حذف القسم بنجاح! 🗑️', 'success');
          } catch (error) {
            showAlert('خطأ في حذف القسم: ' + error.message, 'danger');
          }
        }
      });
    });
  });

  // Focus on input when page loads
  categoryNameInput.focus();
  
  // Add input animation
  categoryNameInput.addEventListener('focus', () => {
    categoryNameInput.style.transform = 'scale(1.02)';
  });
  
  categoryNameInput.addEventListener('blur', () => {
    categoryNameInput.style.transform = 'scale(1)';
  });
}
