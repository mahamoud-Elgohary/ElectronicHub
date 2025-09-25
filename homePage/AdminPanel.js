import { auth, db } from "../config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  child,
  get,
  ref,
  remove,
  set,
  update
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";


onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Please log in as admin first.");
    window.location.href = "../auth/login.html";
    return;
  }

  try {
    const snap = await get(ref(db, "users/" + user.uid));
    if (!snap.exists() || snap.val().role !== "admin") {
      alert("Access denied. Admins only.");
      window.location.href = "../home.html";
      return;
    }
    initAdminPanel();
  } catch (err) {
    console.error("Auth/role check error:", err);
    alert("Error checking permissions. See console.");
    window.location.href = "../home.html";
  }
});

function initAdminPanel() {

  const tbody = document.getElementById("productsBody");
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  const newProductBtn = document.getElementById("newProductBtn");
  const filterCategory = document.getElementById("filter-category");
  const formEl = document.getElementById("productForm");
  const productModal = document.getElementById("productModal");
  const modalLabel = document.getElementById("productModalLabel");
  const pageInfo = document.getElementById("pageInfo");
  const prevPageBtn = document.getElementById("prevPage");
  const nextPageBtn = document.getElementById("nextPage");
  const filterMin = document.getElementById("filter-min");
  const filterMax = document.getElementById("filter-max");
  const sortKeySel = document.getElementById("sort-key");
  const sortDirBtn = document.getElementById("sort-dir");
  const gotoPageInput = document.getElementById("gotoPage");
  const goBtn = document.getElementById("goBtn");
  const PAGE_SIZE = 5;
  let allProducts = [];
  let shownProducts = [];
  let currentPage = 1;
  let openCloseModel;

  let sortKey = "";
  let sortDir = 1;
  let filters = {
    category: "",
    min: null,
    max: null
  };

  function newId() {
    return Date.now().toString();
  }

  async function fetchAllProducts() {
    const fetchId = await get(child(ref(db), "Products"));
    if (!fetchId.exists()) return [];
    const obj = fetchId.val();
    const list = [];
    for (const id in obj) {
      list.push({
        id,
        ...obj[id]
      });
    }
    return list;
  }

  function renderTable(list) {
    const html = list.map((element) => {
      const price = Number(element.Price).toFixed(2);
      const cost = Number(element.Cost).toFixed(2);
      const discount = Number(element.Discount).toFixed(2);
      const qty = Number(element.qty);

      return `
      <tr>
        <td title="${element.id}">${element.id }</td>
        <td>${element.ProductName }</td>
        <td>${price}</td>
        <td>${cost}</td>
        <td>${discount}</td>
        <td>${qty}</td>
        <td>${element.Categoryname }</td>
        <td>
          ${element.imageUrl
            ? `<img src="${element.imageUrl}" alt="${element.ProductName || 'img'}" style="max-width:80px;max-height:60px">`
            : "-"}
        </td>
        <td class="text-nowrap">
          <button class="btn btn-sm btn-outline-primary" data-action="edit" data-id="${element.id}">Edit</button>
          <button class="btn btn-sm btn-outline-danger"  data-action="delete" data-id="${element.id}">Delete</button>
        </td>
      </tr>`;
    }).join("");

    tbody.innerHTML = html;
  }

  function applySearch() {
    const term = (searchInput && searchInput.value ? searchInput.value : "")
      .toLowerCase()
      .trim();

    shownProducts = allProducts.filter(pro => {
      const name = (pro.ProductName || "").toLowerCase();
      const cat = (pro.Categoryname || "").toLowerCase();
      const price = Number(pro.Price) || 0;

      if (filters.category && (pro.Categoryname || "") !== filters.category) return false;
      if (filters.min != null && price < filters.min) return false;
      if (filters.max != null && price > filters.max) return false;

      if (term && !(name.includes(term) || cat.includes(term))) return false;
      return true;
    });

    if (sortKey) {
      const key = sortKey;
      const isText = (key === "ProductName" || key === "Categoryname");
      shownProducts.sort((a, b) => {
        const va = isText ? (a[key] || "").toString().toLowerCase() : (Number(a[key]) || 0);
        const vb = isText ? (b[key] || "").toString().toLowerCase() : (Number(b[key]) || 0);
        if (va < vb) return -1 * sortDir;
        if (va > vb) return 1 * sortDir;
        return 0;
      });
    }

    currentPage = 1;
    renderPage();
  }

  function renderPage() {
    const start = (currentPage - 1) * PAGE_SIZE;
    const slice = shownProducts.slice(start, start + PAGE_SIZE);
    renderTable(slice);
    const totalPages = Math.max(1, Math.ceil(shownProducts.length / PAGE_SIZE));
    pageInfo.textContent = `
  Page ${currentPage} / ${totalPages} • ${shownProducts.length} items`;
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;
  }

  async function loadProducts() {
    allProducts = await fetchAllProducts();

    if (filterCategory) {
      const cats = Array.from(new Set(allProducts.map(p => p.Categoryname).filter(Boolean))).sort();
      filterCategory.innerHTML = `<option value="">All categories</option>` +
        cats.map(c => `<option value="${c}">${c}</option>`).join("");
    }

    applySearch();
  }

  function showModal(title, modalElement = productModal) {
    if (!openCloseModel) openCloseModel = new bootstrap.Modal(modalElement);
    modalLabel.textContent = title;
    openCloseModel.show();
  }

  function hideModal() {
    if (openCloseModel) openCloseModel.hide();
  }

  function fillForm(p) {
    if (!p) {
      document.getElementById("field_id").value = "";
      document.getElementById("field_name").value = "";
      document.getElementById("field_price").value = "";
      document.getElementById("field_cost").value = "";
      document.getElementById("field_discount").value = "";
      document.getElementById("field_qty").value = "";
      document.getElementById("field_cat").value = "";
      document.getElementById("field_image").value = "";
      document.getElementById("field_desc").value = "";
      return;
    }

    document.getElementById("field_id").value = p.id;
    document.getElementById("field_name").value = p.ProductName;
    document.getElementById("field_price").value = p.Price;
    document.getElementById("field_cost").value = p.Cost;
    document.getElementById("field_discount").value = p.Discount;
    document.getElementById("field_qty").value = p.qty;
    document.getElementById("field_cat").value = p.Categoryname;
    document.getElementById("field_image").value = p.imageUrl;
    document.getElementById("field_desc").value = p.Description;
  }

  async function createProduct(data) {
    const id = newId();
    await set(ref(db, `Products/${id}`), data);
  }
  async function updateProduct(id, data) {
    await update(ref(db, `Products/${id}`), data);
  }
  async function deleteProduct(id) {
    await remove(ref(db, `Products/${id}`));
  }

  function readForm() {
    const id = document.getElementById("field_id").value.trim();
    const ProductName = document.getElementById("field_name").value.trim();
    const Price = Number(document.getElementById("field_price").value);
    const Cost = Number(document.getElementById("field_cost").value);
    const Discount = Number(document.getElementById("field_discount").value);
    const qty = parseInt(document.getElementById("field_qty").value, 10);
    const Categoryname = document.getElementById("field_cat").value.trim();
    const imageUrl = document.getElementById("field_image").value.trim();
    const Description = document.getElementById("field_desc").value.trim();

    const errors = [];
    if (!ProductName) errors.push("Name is required");
    if (Price < 0) errors.push("Price must be ≥ 0");
    if (Cost < 0) errors.push("Cost must be ≥ 0");
    if (!imageUrl) errors.push("Image URL is required");
    if (errors.length) {
      alert(errors.join("\n"));
      return null;
    }

    return {
      id,
      data: {
        ProductName,
        Price,
        Cost,
        Discount,
        qty,
        Categoryname,
        imageUrl,
        Description
      }
    };
  }

  newProductBtn.addEventListener("click", function () {
    fillForm(null);
    showModal("New Product");
  });

  formEl.addEventListener("submit", async function (event) {
    event.preventDefault();
    const res = readForm();
    if (!res) return;
    const {
      id,
      data
    } = res;

    try {
      if (id) await updateProduct(id, data);
      else await createProduct(data);
      hideModal();
      await loadProducts();
    } catch (err) {
      console.error(err);
      alert("Firebase error: " + err.message);
    }
  });

  tbody.addEventListener("click", async function (event) {
    const btn = event.target.closest("button[data-action]");
    if (!btn) return;

    const action = btn.getAttribute("data-action");
    const id = btn.getAttribute("data-id");

    if (action === "edit") {
      const pro = allProducts.find(function (edit) {
        return edit.id === id;
      });
      fillForm(pro);
      showModal("Edit Product");
      return;
    }

    if (action === "delete") {
      if (!confirm("Delete this product?")) return;
      try {
        await deleteProduct(id);
        await loadProducts();
      } catch (err) {
        console.error(err);
        alert("Firebase error: " + err.message);
      }
    }
  });

  if (searchInput) {
    searchInput.addEventListener("input", applySearch);
  }
  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      applySearch();
    });
  }
  if (filterMin) {
    filterMin.addEventListener("input", () => {
      const v = filterMin.value.trim();
      filters.min = v === "" ? null : Math.max(0, Number(v));
      applySearch();
    });
  }
  if (filterMax) {
    filterMax.addEventListener("input", () => {
      const v = filterMax.value.trim();
      filters.max = v === "" ? null : Math.max(0, Number(v));
      applySearch();
    });
  }
  if (filterCategory) {
    filterCategory.addEventListener("change", () => {
      filters.category = filterCategory.value || "";
      applySearch();
    });
  }
  if (sortKeySel) {
    sortKeySel.addEventListener("change", () => {
      sortKey = sortKeySel.value || "";
      applySearch();
    });
  }
  if (sortDirBtn) {
    sortDirBtn.addEventListener("click", () => {
      sortDir *= -1;
      sortDirBtn.textContent = (sortDir === 1 ? "⬆️" : "⬇️");
      applySearch();
    });
  }
  prevPageBtn.addEventListener("click", function () {
    currentPage = Math.max(1, currentPage - 1);
    renderPage();
  });
  nextPageBtn.addEventListener("click", function () {
    const totalPages = Math.max(1, Math.ceil(shownProducts.length / PAGE_SIZE));
    currentPage = Math.min(totalPages, currentPage + 1);
    renderPage();
  });

  window.addEventListener("load", async function () {
    await loadProducts();
    applySearch();
  });
  if (goBtn && gotoPageInput) {
    const goHandler = () => {
      const totalPages = Math.max(1, Math.ceil(shownProducts.length / PAGE_SIZE));
      const n = Math.max(1, Math.min(totalPages, parseInt(gotoPageInput.value || "1", 10)));
      currentPage = n;
      renderPage();
    };
    goBtn.addEventListener("click", goHandler);
    gotoPageInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") goHandler();
    });
  }

  // Burger Menu
  const toggleBtn = document.getElementById("menu-toggle");
  const leftSide = document.querySelector(".left-side");
  const rightSide = document.querySelector(".right-side");

  toggleBtn?.addEventListener("click", () => {
    leftSide.classList.toggle("active");
    rightSide.classList.toggle("active");
  });
  document.getElementById('top-search')?.addEventListener('submit', e => e.preventDefault());


  const manageUsersBtn = document.getElementById("manageUsersBtn");
  const usersModal = document.getElementById("usersModal");
  const usersBody = document.getElementById("usersBody");
  const usersMessage = document.getElementById("usersMessage");
  const refreshUsersBtn = document.getElementById("refreshUsersBtn");
  let usersModalInstance = null;

  function openUsersModal() {
    if (!usersModalInstance) usersModalInstance = new bootstrap.Modal(usersModal);
    usersModalInstance.show();
  }

  manageUsersBtn?.addEventListener("click", async () => {
    await loadUsers();
    openUsersModal();
  });

  refreshUsersBtn?.addEventListener("click", async () => {
    await loadUsers();
  });

  async function loadUsers() {
    try {
      usersMessage.textContent = "Loading users…";
      const snap = await get(ref(db, "users"));
      if (!snap.exists()) {
        usersBody.innerHTML = `<tr><td colspan="4">No users found</td></tr>`;
        usersMessage.textContent = "";
        return;
      }

      const usersObj = snap.val();
      const list = Object.keys(usersObj).map(uid => ({ uid, ...usersObj[uid] }));
      list.sort((a, b) => (a.email || "").localeCompare(b.email || ""));
      renderUsersTable(list);
      usersMessage.textContent = `Loaded ${list.length} users`;
    } catch (err) {
      console.error("Failed to load users:", err);
      usersBody.innerHTML = `<tr><td colspan="4">Error loading users. See console.</td></tr>`;
      usersMessage.textContent = "";
    }
  }

  function renderUsersTable(list) {
   const currentUid = auth.currentUser?.uid;

    usersBody.innerHTML = list.map(u => {
      const email = u.email || "(no email)";
      const role = u.role || "user";
      const verified = !!u.verified_at || (u.verified === true) ? "Yes" : (u.verified === false ? "No" : (u.email ? "Unknown" : "N/A"));

      let actions = "";
      if (u.uid === currentUid) {
        actions = `<span class="text-muted small">(you)</span>`;
        if (role !== "admin") {
          actions += ` <button class="btn btn-sm btn-outline-primary ms-2" data-action="make-admin" data-uid="${u.uid}">Make Admin</button>`;
        }
      } else {
        if (role === "admin") {
          actions = `<button class="btn btn-sm btn-outline-warning" data-action="revoke-admin" data-uid="${u.uid}">Revoke Admin</button>`;
        } else {
          actions = `<button class="btn btn-sm btn-outline-primary" data-action="make-admin" data-uid="${u.uid}">Make Admin</button>`;
        }
      }

      return `<tr>
        <td>${escapeHtml(email)}</td>
        <td>${escapeHtml(role)}</td>
        <td>${escapeHtml(verified)}</td>
        <td>${actions}</td>
      </tr>`;
    }).join("");

    usersBody.querySelectorAll("button[data-action]").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const action = btn.getAttribute("data-action");
        const uid = btn.getAttribute("data-uid");
        if (action === "make-admin") {
          if (!confirm("Make this user an admin?")) return;
          await promoteUser(uid);
        } else if (action === "revoke-admin") {
          if (!confirm("Revoke admin privileges for this user?")) return;
          await demoteUser(uid);
        }
      });
    });
  }
  
  async function promoteUser(uid) {
    try {
      await update(ref(db, `users/${uid}`), { role: "admin" });
      await loadUsers();
      alert("User promoted to admin.");
    } catch (err) {
      console.error("promoteUser error:", err);
      alert("Failed to promote user. See console.");
    }
  }

  async function demoteUser(uid) {
    try {
      const currentUid = auth.currentUser?.uid;
      if (uid === currentUid) {
        alert("You cannot revoke your own admin role here.");
        return;
      }
      await update(ref(db, `users/${uid}`), { role: "user" });
      await loadUsers();
      alert("User demoted to user.");
    } catch (err) {
      console.error("demoteUser error:", err);
      alert("Failed to demote user. See console.");
    }
  }

  function escapeHtml(s) {
    if (s == null) return "";
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  window.admin_loadUsers = loadUsers;
}
