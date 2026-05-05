/**
 * ===== FoodieMenu - API Module =====
 * Quản lý kết nối API với MockAPI
 * Sử dụng class APIResource cho các thao tác CRUD
 */

// === Class APIResource - Quản lý gọi API RESTful ===
class APIResource {
  /**
   * Khởi tạo resource API
   * @param {string} apiBaseURL - URL gốc của API
   * @param {string} resourceName - Tên resource (products, categories)
   */
  constructor(apiBaseURL, resourceName) {
    this.resourceName = resourceName;
    this.baseUrl = `${apiBaseURL}/${resourceName}`;
  }

  /**
   * Lấy toàn bộ danh sách resource
   * @returns {Promise<Array>} Danh sách các item
   */
  async layDanhSach() {
    try {
      const response = await fetch(this.baseUrl);

      if (!response.ok) {
        throw new Error(`Không thể lấy danh sách ${this.resourceName}`);
      }

      const data = await response.json();
      console.log(`✅ Danh sách ${this.resourceName}:`, data);
      return data;
    } catch (error) {
      console.error(`❌ Lỗi lấy danh sách ${this.resourceName}:`, error);
      throw error;
    }
  }

  /**
   * Lấy một item theo ID
   * @param {string|number} id - ID của item
   * @returns {Promise<Object>} Thông tin item
   */
  async layMotPhan(id) {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);

      if (!response.ok) {
        throw new Error(`Không thể lấy ${this.resourceName} có id = ${id}`);
      }

      const data = await response.json();
      console.log(`✅ Chi tiết ${this.resourceName}:`, data);
      return data;
    } catch (error) {
      console.error(`❌ Lỗi lấy ${this.resourceName} id=${id}:`, error);
      throw error;
    }
  }

  /**
   * Thêm mới một item
   * @param {Object} dinhNghia - Dữ liệu item mới
   * @returns {Promise<Object>} Item vừa tạo
   */
  async themMoi(dinhNghia) {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dinhNghia),
      });

      if (!response.ok) {
        throw new Error(`Không thể thêm ${this.resourceName}`);
      }

      const data = await response.json();
      console.log(`✅ Đã thêm ${this.resourceName}:`, data);
      return data;
    } catch (error) {
      console.error(`❌ Lỗi thêm ${this.resourceName}:`, error);
      throw error;
    }
  }

  /**
   * Cập nhật item theo ID
   * @param {string|number} id - ID của item cần cập nhật
   * @param {Object} thongTinMoi - Dữ liệu mới
   * @returns {Promise<Object>} Item đã cập nhật
   */
  async capNhat(id, thongTinMoi) {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(thongTinMoi),
      });

      if (!response.ok) {
        throw new Error(`Không thể cập nhật ${this.resourceName} có id = ${id}`);
      }

      const data = await response.json();
      console.log(`✅ Đã cập nhật ${this.resourceName}:`, data);
      return data;
    } catch (error) {
      console.error(`❌ Lỗi cập nhật ${this.resourceName} id=${id}:`, error);
      throw error;
    }
  }

  /**
   * Xóa item theo ID
   * @param {string|number} id - ID của item cần xóa
   * @returns {Promise<Object>} Kết quả xóa
   */
  async xoa(id) {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Không thể xóa ${this.resourceName} có id = ${id}`);
      }

      const data = await response.json();
      console.log(`✅ Đã xóa ${this.resourceName}:`, data);
      return data;
    } catch (error) {
      console.error(`❌ Lỗi xóa ${this.resourceName} id=${id}:`, error);
      throw error;
    }
  }

  /**
   * Tìm kiếm theo tên
   * @param {string} tuKhoa - Từ khóa tìm kiếm
   * @returns {Promise<Array>} Danh sách kết quả
   */
  async timKiem(tuKhoa) {
    try {
      const response = await fetch(`${this.baseUrl}?name=${encodeURIComponent(tuKhoa)}`);

      if (!response.ok) {
        throw new Error(`Không thể tìm kiếm ${this.resourceName}`);
      }

      const data = await response.json();
      console.log(`🔍 Kết quả tìm kiếm "${tuKhoa}":`, data);
      return data;
    } catch (error) {
      console.error(`❌ Lỗi tìm kiếm ${this.resourceName}:`, error);
      throw error;
    }
  }
}

// === Cấu hình API ===
const API_BASE_URL = "https://69f9a797c509a40d3aa2f26f.mockapi.io/api/v1";

// === Khởi tạo các resource API ===
const productAPI = new APIResource(API_BASE_URL, "dishes");
const categoryAPI = new APIResource(API_BASE_URL, "categories");
