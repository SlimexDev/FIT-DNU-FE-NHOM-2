/**
 * ===== FoodieMenu - Utils Module =====
 * Các hàm tiện ích dùng chung cho toàn bộ ứng dụng
 * Bao gồm: format dữ liệu, toast, validate, loading spinner
 */

// === Hàm format giá tiền Việt Nam ===
/**
 * Chuyển đổi số thành định dạng tiền VNĐ
 * @param {number} price - Giá trị cần format
 * @returns {string} Chuỗi giá tiền đã format (vd: "150.000đ")
 */
function formatPrice(price) {
  if (typeof price !== "number" || isNaN(price)) {
    return "0đ";
  }
  return price.toLocaleString("vi-VN") + "đ";
}

// === Hàm rút gọn mô tả ===
/**
 * Cắt chuỗi nếu quá dài và thêm "..."
 * @param {string} text - Chuỗi gốc
 * @param {number} maxLength - Độ dài tối đa
 * @returns {string} Chuỗi đã rút gọn
 */
function truncateText(text, maxLength) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

// === Hàm format ngày tháng ===
/**
 * Format chuỗi ISO date thành định dạng ngày Việt Nam
 * @param {string} dateString - Chuỗi ngày ISO
 * @returns {string} Ngày đã format (vd: "05/05/2026")
 */
function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// === Hệ thống Toast Notification ===
/**
 * Tạo container chứa toast nếu chưa có
 * @returns {HTMLElement} Container toast
 */
function getToastContainer() {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Hiển thị thông báo toast
 * @param {string} message - Nội dung thông báo
 * @param {string} type - Loại toast: "success", "error", "warning", "info"
 * @param {number} duration - Thời gian hiển thị (ms)
 */
function showToast(message, type = "info", duration = 3000) {
  const container = getToastContainer();

  // Tạo phần tử toast
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  // Icon tương ứng với loại toast
  const icons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  };

  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">×</button>
  `;

  container.appendChild(toast);

  // Hiệu ứng xuất hiện
  requestAnimationFrame(() => {
    toast.classList.add("toast-show");
  });

  // Tự động ẩn sau duration
  const timer = setTimeout(() => {
    toast.classList.remove("toast-show");
    toast.classList.add("toast-hide");
    // Xóa khỏi DOM sau khi animation kết thúc
    setTimeout(() => toast.remove(), 400);
  }, duration);

  // Cho phép đóng sớm bằng click
  toast.querySelector(".toast-close").addEventListener("click", () => {
    clearTimeout(timer);
    toast.classList.remove("toast-show");
    toast.classList.add("toast-hide");
    setTimeout(() => toast.remove(), 400);
  });
}

// === Hệ thống Validate Form ===
/**
 * Validate một trường input
 * @param {HTMLInputElement} input - Phần tử input cần validate
 * @param {Array} rules - Mảng các rule validate
 * @returns {boolean} true nếu hợp lệ
 */
function validateField(input, rules) {
  const value = input.value.trim();
  let isValid = true;
  let errorMessage = "";

  // Duyệt qua từng rule để kiểm tra
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];

    if (rule.required && value === "") {
      isValid = false;
      errorMessage = rule.message || "Trường này không được để trống";
      break;
    }

    if (rule.minValue !== undefined && Number(value) < rule.minValue) {
      isValid = false;
      errorMessage = rule.message || `Giá trị phải lớn hơn hoặc bằng ${rule.minValue}`;
      break;
    }

    if (rule.greaterThan !== undefined && Number(value) <= rule.greaterThan) {
      isValid = false;
      errorMessage = rule.message || `Giá trị phải lớn hơn ${rule.greaterThan}`;
      break;
    }

    if (rule.isUrl && value !== "") {
      const urlPattern = /^(https?:\/\/)[\w\-]+(\.[\w\-]+)+([\w\-.,@?^=%&:/~+#]*[\w\-@?^=%&/~+#])?$/;
      if (!urlPattern.test(value)) {
        isValid = false;
        errorMessage = rule.message || "URL không hợp lệ (phải bắt đầu bằng http:// hoặc https://)";
        break;
      }
    }

    if (rule.minLength && value.length < rule.minLength) {
      isValid = false;
      errorMessage = rule.message || `Tối thiểu ${rule.minLength} ký tự`;
      break;
    }
  }

  // Hiển thị hoặc xóa lỗi inline
  showFieldError(input, isValid, errorMessage);
  return isValid;
}

/**
 * Hiển thị lỗi inline ngay dưới input
 * @param {HTMLInputElement} input - Phần tử input
 * @param {boolean} isValid - Trạng thái hợp lệ
 * @param {string} message - Thông báo lỗi
 */
function showFieldError(input, isValid, message) {
  // Tìm hoặc tạo phần tử hiển thị lỗi
  let errorEl = input.parentElement.querySelector(".field-error");

  if (!isValid) {
    if (!errorEl) {
      errorEl = document.createElement("span");
      errorEl.className = "field-error";
      input.parentElement.appendChild(errorEl);
    }
    errorEl.textContent = message;
    input.classList.add("input-error");
    input.classList.remove("input-valid");
  } else {
    if (errorEl) {
      errorEl.remove();
    }
    input.classList.remove("input-error");
    if (input.value.trim() !== "") {
      input.classList.add("input-valid");
    }
  }
}

/**
 * Validate toàn bộ form sản phẩm
 * @param {HTMLFormElement} form - Phần tử form
 * @returns {boolean} true nếu tất cả fields hợp lệ
 */
function validateProductForm(form) {
  let isFormValid = true;

  // Định nghĩa rules cho từng field
  const fieldRules = {
    "product-name": [
      { required: true, message: "Vui lòng nhập tên món ăn" },
      { minLength: 2, message: "Tên món ăn phải có ít nhất 2 ký tự" },
    ],
    "product-price": [
      { required: true, message: "Vui lòng nhập giá" },
      { greaterThan: 0, message: "Giá phải lớn hơn 0" },
    ],
    "product-category": [
      { required: true, message: "Vui lòng chọn danh mục" },
    ],
    "product-image": [
      { isUrl: true, message: "URL hình ảnh không hợp lệ (để trống nếu không có)" },
    ],
    "product-stock": [
      { required: true, message: "Vui lòng nhập số lượng tồn kho" },
      { minValue: 0, message: "Số lượng tồn kho không được âm" },
    ],
    "product-description": [
      { required: true, message: "Vui lòng nhập mô tả" },
      { minLength: 10, message: "Mô tả phải có ít nhất 10 ký tự" },
    ],
  };

  // Duyệt qua từng field và validate
  const fieldNames = Object.keys(fieldRules);
  for (let i = 0; i < fieldNames.length; i++) {
    const fieldName = fieldNames[i];
    const input = form.querySelector(`#${fieldName}`);
    if (input) {
      const valid = validateField(input, fieldRules[fieldName]);
      if (!valid) {
        isFormValid = false;
      }
    }
  }

  return isFormValid;
}

// === Loading Spinner Glass Style ===
/**
 * Hiển thị loading spinner
 * @param {string} containerId - ID của container chứa spinner
 */
function showLoading(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Kiểm tra nếu đã có spinner thì không tạo thêm
  if (container.querySelector(".glass-loading")) return;

  const loader = document.createElement("div");
  loader.className = "glass-loading";
  loader.innerHTML = `
    <div class="glass-spinner">
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
      <span class="spinner-text">Đang tải...</span>
    </div>
  `;
  container.appendChild(loader);
}

/**
 * Ẩn loading spinner
 * @param {string} containerId - ID của container chứa spinner
 */
function hideLoading(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const loader = container.querySelector(".glass-loading");
  if (loader) {
    loader.classList.add("fade-out");
    setTimeout(() => loader.remove(), 300);
  }
}

// === Hàm debounce cho tìm kiếm ===
/**
 * Tạo hàm debounce để giới hạn tần suất gọi
 * @param {Function} func - Hàm cần debounce
 * @param {number} delay - Thời gian delay (ms)
 * @returns {Function} Hàm đã debounce
 */
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// === Hàm tạo badge trạng thái tồn kho ===
/**
 * Trả về HTML badge dựa trên số lượng tồn kho
 * @param {number} stock - Số lượng tồn kho
 * @returns {string} HTML badge
 */
function getStockBadge(stock) {
  if (stock <= 0) {
    return '<span class="badge badge-out">Hết hàng</span>';
  } else if (stock <= 5) {
    return `<span class="badge badge-low">Còn ${stock}</span>`;
  } else {
    return `<span class="badge badge-in">Còn ${stock}</span>`;
  }
}

// === Hàm tạo ID ngẫu nhiên ===
/**
 * Tạo chuỗi ID ngẫu nhiên
 * @param {number} length - Độ dài chuỗi
 * @returns {string} Chuỗi ngẫu nhiên
 */
function generateId(length = 8) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  let i = 0;
  while (i < length) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
    i++;
  }
  return result;
}
