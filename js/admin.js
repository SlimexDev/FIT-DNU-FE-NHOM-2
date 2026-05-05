/**
 * ===== FoodieMenu - Admin Module =====
 * Xử lý logic trang quản trị: CRUD sản phẩm, form validate, bảng dữ liệu
 */

// === Biến toàn cục ===
let danhSachAdmin = []; // Danh sách sản phẩm cho admin
let dangSuaId = null; // ID sản phẩm đang sửa (null = đang thêm mới)

// === Hàm render một hàng trong bảng ===
function renderTableRow(sp) {
  const hinhAnh = sp.image || "https://placehold.co/50x50/1a1025/8b5cf6?text=N/A";
  const gia = formatPrice(Number(sp.price) || 0);
  const stockBadge = getStockBadge(Number(sp.stock) || 0);

  return `
    <tr data-id="${sp.id}">
      <td>
        <img src="${hinhAnh}" alt="${sp.name}" class="table-img"
             onerror="this.src='https://placehold.co/50x50/1a1025/8b5cf6?text=N/A'">
      </td>
      <td><strong>${sp.name || "N/A"}</strong></td>
      <td><span class="card-category">${sp.category || "N/A"}</span></td>
      <td>${gia}</td>
      <td>${stockBadge}</td>
      <td>
        <div class="table-actions">
          <button class="btn btn-sm btn-secondary" onclick="suaSanPham('${sp.id}')">✏️ Sửa</button>
          <button class="btn btn-sm btn-danger" onclick="xoaSanPham('${sp.id}')">🗑️ Xóa</button>
        </div>
      </td>
    </tr>
  `;
}

// === Hàm hiển thị bảng sản phẩm ===
function hienThiBang(danhSach) {
  const tbody = document.getElementById("product-table-body");
  if (!tbody) return;

  if (!danhSach || danhSach.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted);">
          <div style="font-size:2.5rem;margin-bottom:12px;">📭</div>
          Không tìm thấy món ăn nào.
        </td>
      </tr>
    `;
    return;
  }

  let html = "";
  for (let i = 0; i < danhSach.length; i++) {
    html += renderTableRow(danhSach[i]);
  }
  tbody.innerHTML = html;
}

// === Hàm lọc danh sách Admin ===
function locDanhSachAdmin() {
  const tuKhoa = document.getElementById("admin-search-input").value.trim().toLowerCase();
  const danhMuc = document.getElementById("admin-filter-category").value;

  const ketQua = danhSachAdmin.filter(sp => {
    const matchName = (sp.name || "").toLowerCase().includes(tuKhoa);
    const matchCategory = danhMuc === "" || sp.category === danhMuc;
    return matchName && matchCategory;
  });

  hienThiBang(ketQua);
}

// === Các hàm CRUD và Form ===
function layDuLieuForm() {
  return {
    name: document.getElementById("product-name").value.trim(),
    price: Number(document.getElementById("product-price").value),
    category: document.getElementById("product-category").value,
    image: document.getElementById("product-image").value.trim(),
    stock: Number(document.getElementById("product-stock").value),
    description: document.getElementById("product-description").value.trim(),
    createdAt: new Date().toISOString(),
  };
}

function resetForm() {
  const form = document.getElementById("product-form");
  form.reset();
  document.getElementById("product-id").value = "";
  dangSuaId = null;
  document.getElementById("form-title").textContent = "➕ Thêm Món Mới";
  document.getElementById("btn-submit").textContent = "➕ Thêm món";
  document.getElementById("btn-cancel").style.display = "none";
  document.getElementById("image-preview").innerHTML = "<span>Xem trước hình ảnh</span>";
  
  const errorInputs = form.querySelectorAll(".input-error, .input-valid");
  errorInputs.forEach(el => el.classList.remove("input-error", "input-valid"));
  form.querySelectorAll(".field-error").forEach(el => el.remove());
}

function suaSanPham(id) {
  const sanPham = danhSachAdmin.find(sp => String(sp.id) === String(id));
  if (!sanPham) return;

  dangSuaId = id;
  document.getElementById("product-id").value = id;
  document.getElementById("product-name").value = sanPham.name || "";
  document.getElementById("product-price").value = sanPham.price || "";
  document.getElementById("product-category").value = sanPham.category || "";
  document.getElementById("product-image").value = sanPham.image || "";
  document.getElementById("product-stock").value = sanPham.stock || 0;
  document.getElementById("product-description").value = sanPham.description || "";

  document.getElementById("form-title").textContent = "✏️ Sửa Món Ăn";
  document.getElementById("btn-submit").textContent = "💾 Cập nhật";
  document.getElementById("btn-cancel").style.display = "inline-flex";

  capNhatPreviewAnh();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function xoaSanPham(id) {
  if (!confirm("Bạn có chắc muốn xóa món ăn này?")) return;
  try {
    showLoading("table-wrapper");
    await productAPI.xoa(id);
    await taiDanhSach();
    showToast("Đã xóa món ăn!", "success");
    if (dangSuaId === id) resetForm();
  } catch (error) {
    showToast("Xóa thất bại!", "error");
  } finally {
    hideLoading("table-wrapper");
  }
}

async function xuLySubmit(event) {
  event.preventDefault();
  const form = document.getElementById("product-form");
  if (!validateProductForm(form)) {
    showToast("Vui lòng kiểm tra lại thông tin!", "warning");
    return;
  }

  const duLieu = layDuLieuForm();
  try {
    showLoading("table-wrapper");
    if (dangSuaId) {
      await productAPI.capNhat(dangSuaId, duLieu);
      showToast("Cập nhật thành công!", "success");
    } else {
      await productAPI.themMoi(duLieu);
      showToast("Thêm món mới thành công!", "success");
    }
    resetForm();
    await taiDanhSach();
  } catch (error) {
    showToast("Thao tác thất bại!", "error");
  } finally {
    hideLoading("table-wrapper");
  }
}

function capNhatPreviewAnh() {
  const url = document.getElementById("product-image").value.trim();
  const preview = document.getElementById("image-preview");
  preview.innerHTML = url ? `<img src="${url}" onerror="this.parentElement.innerHTML='<span>URL không hợp lệ</span>'">` : "<span>Xem trước hình ảnh</span>";
}

async function taiDanhSach() {
  try {
    showLoading("table-wrapper");
    danhSachAdmin = await productAPI.layDanhSach();
    hienThiBang(danhSachAdmin);
  } catch (error) {
    showToast("Không thể tải danh sách!", "error");
  } finally {
    hideLoading("table-wrapper");
  }
}

function dangKySuKienAdmin() {
  document.getElementById("product-form").addEventListener("submit", xuLySubmit);
  document.getElementById("btn-cancel").addEventListener("click", resetForm);
  document.getElementById("product-image").addEventListener("input", debounce(capNhatPreviewAnh, 500));
  document.getElementById("admin-search-input").addEventListener("input", debounce(locDanhSachAdmin, 300));
  document.getElementById("admin-filter-category").addEventListener("change", locDanhSachAdmin);
}

document.addEventListener("DOMContentLoaded", () => {
  // === Kiểm tra đăng nhập (Authentication) ===
  const adminData = sessionStorage.getItem("foodieAdmin");
  if (!adminData) {
    // Nếu chưa đăng nhập, chuyển hướng về trang login
    window.location.href = "login.html";
    return; // Dừng việc thực thi script còn lại
  }

  // === Đăng ký sự kiện Đăng xuất ===
  const btnLogout = document.getElementById("btn-logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", (e) => {
      e.preventDefault();
      if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
        sessionStorage.removeItem("foodieAdmin");
        window.location.href = "login.html";
      }
    });
  }

  // Khởi tạo các sự kiện và tải dữ liệu quản lý
  dangKySuKienAdmin();
  taiDanhSach();
});
