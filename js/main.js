/**
 * ===== FoodieMenu - Main Module =====
 * Xử lý logic trang chủ: hiển thị sản phẩm, tìm kiếm, lọc, modal chi tiết
 */

// === Biến toàn cục ===
let danhSachSanPham = []; // Lưu trữ toàn bộ danh sách sản phẩm
let danhSachDanhMuc = []; // Lưu trữ danh sách danh mục

// === Hàm render một card sản phẩm ===
/**
 * Tạo HTML cho một card sản phẩm Glass style
 * @param {Object} sanPham - Đối tượng sản phẩm
 * @param {number} index - Vị trí trong danh sách
 * @returns {string} HTML card
 */
function renderProductCard(sanPham, index) {
  const stockBadge = getStockBadge(Number(sanPham.stock) || 0);
  const moTa = truncateText(sanPham.description || "Chưa có mô tả", 60);
  const gia = formatPrice(Number(sanPham.price) || 0);
  const hinhAnh = sanPham.image || "https://placehold.co/400x300/1a1025/8b5cf6?text=No+Image";
  const isOutOfStock = Number(sanPham.stock) <= 0;

  return `
    <div class="glass-card ${isOutOfStock ? 'out-of-stock' : ''}" 
         data-id="${sanPham.id}" 
         onclick="moModalChiTiet('${sanPham.id}')"
         style="animation-delay: ${index * 0.08}s">
      <div class="card-image-wrapper">
        <img src="${hinhAnh}" alt="${sanPham.name}" class="card-image" 
             onerror="this.src='https://placehold.co/400x300/1a1025/8b5cf6?text=No+Image'">
        <div class="card-badge">${stockBadge}</div>
      </div>
      <div class="card-body">
        <span class="card-category">${sanPham.category || "Chưa phân loại"}</span>
        <h3 class="card-title">${sanPham.name || "Chưa có tên"}</h3>
        <p class="card-desc">${moTa}</p>
        <div class="card-footer">
          <span class="card-price">${gia}</span>
          ${stockBadge}
        </div>
      </div>
    </div>
  `;
}

// === Hàm hiển thị danh sách sản phẩm ===
/**
 * Render toàn bộ danh sách sản phẩm vào grid
 * @param {Array} danhSach - Mảng sản phẩm cần hiển thị
 */
function hienThiSanPham(danhSach) {
  const grid = document.getElementById("product-grid");
  if (!grid) return;

  if (!danhSach || danhSach.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🍽️</div>
        <h3>Không tìm thấy món ăn</h3>
        <p>Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
      </div>
    `;
    return;
  }

  // Sử dụng hàm map và join để render danh sách
  let htmlContent = "";
  for (let i = 0; i < danhSach.length; i++) {
    htmlContent += renderProductCard(danhSach[i], i);
  }
  grid.innerHTML = htmlContent;
}

// === Hàm load danh mục vào filter ===
/**
 * Lấy danh mục từ danh sách sản phẩm và đổ vào select
 */
function loadDanhMuc() {
  const filterCategory = document.getElementById("filter-category");
  if (!filterCategory) return;

  // Trích xuất danh mục duy nhất từ danh sách sản phẩm
  const danhMucSet = new Set();
  for (let i = 0; i < danhSachSanPham.length; i++) {
    if (danhSachSanPham[i].category) {
      danhMucSet.add(danhSachSanPham[i].category);
    }
  }

  // Tạo options
  let optionsHTML = '<option value="">Tất cả danh mục</option>';
  const danhMucArr = Array.from(danhMucSet);
  for (let i = 0; i < danhMucArr.length; i++) {
    optionsHTML += `<option value="${danhMucArr[i]}">${danhMucArr[i]}</option>`;
  }
  filterCategory.innerHTML = optionsHTML;
}

// === Hàm lọc sản phẩm ===
/**
 * Lọc danh sách sản phẩm theo từ khóa, danh mục và giá
 * Sử dụng if/else và vòng lặp for để kiểm tra điều kiện
 * @returns {Array} Danh sách đã lọc
 */
function locSanPham() {
  const tuKhoa = document.getElementById("search-input").value.trim().toLowerCase();
  const danhMuc = document.getElementById("filter-category").value;
  const mucGia = document.getElementById("filter-price").value;

  let ketQua = [];

  for (let i = 0; i < danhSachSanPham.length; i++) {
    const sp = danhSachSanPham[i];
    let phuHop = true;

    // Lọc theo từ khóa tìm kiếm
    if (tuKhoa !== "") {
      const tenSP = (sp.name || "").toLowerCase();
      const moTaSP = (sp.description || "").toLowerCase();
      if (tenSP.indexOf(tuKhoa) === -1 && moTaSP.indexOf(tuKhoa) === -1) {
        phuHop = false;
      }
    }

    // Lọc theo danh mục
    if (phuHop && danhMuc !== "") {
      if (sp.category !== danhMuc) {
        phuHop = false;
      }
    }

    // Lọc theo mức giá
    if (phuHop && mucGia !== "") {
      const giaRange = mucGia.split("-");
      const giaMin = Number(giaRange[0]);
      const giaMax = Number(giaRange[1]);
      const giaSP = Number(sp.price) || 0;

      if (giaSP < giaMin || giaSP > giaMax) {
        phuHop = false;
      }
    }

    if (phuHop) {
      ketQua.push(sp);
    }
  }

  return ketQua;
}

// === Hàm xử lý sự kiện lọc ===
/**
 * Gọi lọc và render lại kết quả
 */
function xuLyLoc() {
  const ketQua = locSanPham();
  hienThiSanPham(ketQua);
}

// === Hàm mở modal chi tiết sản phẩm ===
/**
 * Hiển thị modal với thông tin chi tiết sản phẩm
 * @param {string} id - ID sản phẩm
 */
function moModalChiTiet(id) {
  // Tìm sản phẩm trong danh sách đã load
  let sanPham = null;
  for (let i = 0; i < danhSachSanPham.length; i++) {
    if (String(danhSachSanPham[i].id) === String(id)) {
      sanPham = danhSachSanPham[i];
      break;
    }
  }

  if (!sanPham) {
    showToast("Không tìm thấy sản phẩm!", "error");
    return;
  }

  const modal = document.getElementById("product-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalBody = document.getElementById("modal-body");

  modalTitle.textContent = sanPham.name || "Chi tiết món ăn";

  const hinhAnh = sanPham.image || "https://placehold.co/600x300/1a1025/8b5cf6?text=No+Image";
  const stockBadge = getStockBadge(Number(sanPham.stock) || 0);

  modalBody.innerHTML = `
    <img src="${hinhAnh}" alt="${sanPham.name}" class="modal-image"
         onerror="this.src='https://placehold.co/600x300/1a1025/8b5cf6?text=No+Image'">
    <div class="detail-row">
      <span class="detail-label">Giá</span>
      <span class="detail-value detail-price">${formatPrice(Number(sanPham.price) || 0)}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Danh mục</span>
      <span class="detail-value">${sanPham.category || "Chưa phân loại"}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Tồn kho</span>
      <span class="detail-value">${stockBadge}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Ngày tạo</span>
      <span class="detail-value">${formatDate(sanPham.createdAt)}</span>
    </div>
    <div style="margin-top:16px;">
      <span class="detail-label">Mô tả</span>
      <p style="margin-top:8px;color:var(--text-secondary);line-height:1.7;font-size:0.95rem;">
        ${sanPham.description || "Chưa có mô tả cho món ăn này."}
      </p>
    </div>
  `;

  // Hiển thị modal
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

// === Hàm đóng modal ===
function dongModal() {
  const modal = document.getElementById("product-modal");
  modal.classList.remove("active");
  document.body.style.overflow = "";
}

// === Khởi tạo sự kiện ===
/**
 * Đăng ký tất cả event listeners cho trang chủ
 */
function dangKySuKien() {
  // Sự kiện tìm kiếm (debounce 300ms)
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", debounce(xuLyLoc, 300));
  }

  // Sự kiện filter danh mục
  const filterCategory = document.getElementById("filter-category");
  if (filterCategory) {
    filterCategory.addEventListener("change", xuLyLoc);
  }

  // Sự kiện filter giá
  const filterPrice = document.getElementById("filter-price");
  if (filterPrice) {
    filterPrice.addEventListener("change", xuLyLoc);
  }

  // Sự kiện đóng modal
  const modalClose = document.getElementById("modal-close");
  if (modalClose) {
    modalClose.addEventListener("click", dongModal);
  }

  // Đóng modal khi click overlay
  const modalOverlay = document.getElementById("product-modal");
  if (modalOverlay) {
    modalOverlay.addEventListener("click", function (e) {
      if (e.target === modalOverlay) {
        dongModal();
      }
    });
  }

  // Đóng modal bằng phím Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      dongModal();
    }
  });
}

// === Hàm khởi tạo ứng dụng ===
/**
 * Load dữ liệu từ API và render giao diện
 */
async function khoiTaoApp() {
  try {
    // Hiển thị loading
    showLoading("product-grid");

    // Gọi API lấy danh sách sản phẩm
    danhSachSanPham = await productAPI.layDanhSach();

    // Ẩn loading
    hideLoading("product-grid");

    // Hiển thị sản phẩm và load danh mục
    hienThiSanPham(danhSachSanPham);
    loadDanhMuc();

    // Đăng ký sự kiện
    dangKySuKien();

    showToast("Tải thực đơn thành công!", "success");
  } catch (error) {
    hideLoading("product-grid");
    console.error("Lỗi khởi tạo:", error);
    showToast("Không thể tải dữ liệu. Vui lòng thử lại!", "error");

    // Hiển thị trạng thái lỗi
    const grid = document.getElementById("product-grid");
    if (grid) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⚠️</div>
          <h3>Lỗi kết nối</h3>
          <p>Không thể tải dữ liệu từ server. Vui lòng thử lại sau.</p>
          <button class="btn btn-primary" style="margin-top:20px" onclick="khoiTaoApp()">🔄 Thử lại</button>
        </div>
      `;
    }
  }
}

// === Chạy ứng dụng khi DOM sẵn sàng ===
document.addEventListener("DOMContentLoaded", khoiTaoApp);
