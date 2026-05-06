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

// === Hàm hiển thị món ăn nổi bật ===
/**
 * Render thanh ngang món ăn nổi bật và xử lý auto scroll bằng jQuery
 * @param {Array} danhSach - Mảng sản phẩm 
 */
function hienThiMonAnNoiBat(danhSach) {
  const scrollContainer = $("#featured-scroll");
  if (!scrollContainer.length) return;

  // Lấy 8 món đầu tiên
  const featured = danhSach.slice(0, 8);

  let htmlContent = "";
  for (let i = 0; i < featured.length; i++) {
    const sp = featured[i];
    const gia = formatPrice(Number(sp.price) || 0);
    const hinhAnh = sp.image || "https://placehold.co/400x300/1a1025/8b5cf6?text=No+Image";

    htmlContent += `
      <div class="glass-card featured-card" data-id="${sp.id}" onclick="moModalChiTiet('${sp.id}')">
        <span class="badge badge-hot card-badge">Hot</span>
        <div class="card-image-wrapper">
          <img src="${hinhAnh}" alt="${sp.name}" class="card-image" onerror="this.src='https://placehold.co/400x300/1a1025/8b5cf6?text=No+Image'">
        </div>
        <div class="card-body">
          <span class="card-category" style="margin-bottom:4px; padding:2px 8px; font-size:0.65rem; border-radius:20px; background:rgba(139,92,246,0.15); color:var(--primary-light); border:1px solid rgba(139,92,246,0.25); display:inline-block;">${sp.category || "Signature"}</span>
          <h3 class="card-title">${sp.name || "Chưa có tên"}</h3>
          <span class="card-price">${gia}</span>
        </div>
      </div>
    `;
  }

  scrollContainer.html(htmlContent);

  // === Khởi tạo jQuery Auto Scroll ===
  let isHovered = false;
  let scrollStep = 1;
  let scrollInterval;

  function startScroll() {
    scrollInterval = setInterval(() => {
      if (!isHovered) {
        let el = scrollContainer[0];
        let maxScroll = el.scrollWidth - el.clientWidth;

        // Nếu scroll đến cuối, quay lại đầu
        if (el.scrollLeft >= maxScroll - 1) {
          el.scrollLeft = 0;
        } else {
          el.scrollLeft += scrollStep;
        }
      }
    }, 30); // Tốc độ chạy
  }

  startScroll();

  // Dừng scroll khi hover
  scrollContainer.on("mouseenter", () => isHovered = true);
  scrollContainer.on("mouseleave", () => isHovered = false);

  // Điều khiển bằng nút
  $("#featured-next").on("click", function () {
    scrollContainer.animate({ scrollLeft: "+=335" }, 300);
  });

  $("#featured-prev").on("click", function () {
    scrollContainer.animate({ scrollLeft: "-=335" }, 300);
  });
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

  // Hiệu ứng scroll navbar
  window.addEventListener("scroll", () => {
    const navbar = document.getElementById("navbar");
    if (navbar) {
      if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    }
  });
}

// === Hàm khởi tạo Mascot Pet ===
function initMascotPet() {
  const mascot = $("#mascot-pet");
  const tooltip = $("#mascot-tooltip");
  const body = $("#mascot-body");

  if (!mascot.length) return;

  const tooltips = [
    "Em đói quá, order món đi! 🍔",
    "Món Gà Rang Muối ngon lắm nè! 🍗",
    "Thực đơn hôm nay tuyệt vời! ✨",
    "Moo moo~ Chúc bạn ngon miệng! 🐮",
    "Click vào món ăn để xem chi tiết nhé!",
    "Nhi Bếu🐷!",
    "Ngọc cho🐕!!"
  ];

  let moveInterval;
  let hideTimeout;

  function getRandomPos() {
    const ww = $(window).width() - 100;
    const wh = $(window).height() - 150;
    const x = Math.max(20, Math.floor(Math.random() * ww));
    const y = Math.max(80, Math.floor(Math.random() * wh)); // 80 to avoid navbar
    return { x, y };
  }

  function moveMascot() {
    if (mascot.hasClass("hidden")) return;

    const pos = getRandomPos();
    const currentX = parseInt(mascot.css("left")) || $(window).width() - 100;

    // Flip based on direction
    if (pos.x < currentX) {
      body.css("transform", "scaleX(1)");
    } else {
      body.css("transform", "scaleX(-1)");
    }

    mascot.css({
      "left": pos.x + "px",
      "top": pos.y + "px",
      "bottom": "auto",
      "right": "auto"
    });

    // Thỉnh thoảng nhảy lên
    if (Math.random() > 0.7) {
      setTimeout(() => {
        mascot.addClass("jumping");
        setTimeout(() => mascot.removeClass("jumping"), 500);
      }, 500);
    }
  }

  function scheduleMove() {
    clearInterval(moveInterval);
    moveInterval = setInterval(moveMascot, 5000 + Math.random() * 4000); // 5s - 9s
  }

  function scheduleHide() {
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => {
      mascot.addClass("hidden");

      // Hiện lại sau 15-20s ở vị trí ngẫu nhiên
      setTimeout(() => {
        const pos = getRandomPos();
        mascot.css({ left: pos.x, top: pos.y, bottom: "auto", right: "auto" });
        mascot.removeClass("hidden");
        scheduleHide();
      }, 15000 + Math.random() * 5000);

    }, 35000); // Ẩn sau 35s
  }

  // Hover effect
  mascot.on("mouseenter", () => {
    body.text("🤩");
    clearInterval(moveInterval); // Dừng di chuyển khi hover
    clearTimeout(hideTimeout);
  });

  mascot.on("mouseleave", () => {
    body.text("🐮");
    scheduleMove();
    scheduleHide();
  });

  // Click effect
  mascot.on("click", () => {
    const randomTip = tooltips[Math.floor(Math.random() * tooltips.length)];
    tooltip.text(randomTip);
    mascot.addClass("show-tooltip jumping");

    setTimeout(() => mascot.removeClass("jumping"), 500);
    setTimeout(() => mascot.removeClass("show-tooltip"), 3000);
  });

  // Khởi động
  setTimeout(() => {
    mascot.css({
      left: ($(window).width() - 100) + "px",
      top: ($(window).height() - 150) + "px",
      bottom: "auto",
      right: "auto",
      position: "fixed"
    });
    scheduleMove();
    scheduleHide();
  }, 2000); // Bắt đầu sau 2s
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
    hienThiMonAnNoiBat(danhSachSanPham);
    loadDanhMuc();

    // Đăng ký sự kiện
    dangKySuKien();
    initMascotPet();

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
