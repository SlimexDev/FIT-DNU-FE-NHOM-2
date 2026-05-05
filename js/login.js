/**
 * ===== FoodieMenu - Login Module =====
 * Xử lý logic đăng nhập: xác thực thông tin, lưu trữ session bằng localStorage
 */

document.addEventListener("DOMContentLoaded", () => {
  // Dọn dẹp localStorage cũ (nếu có) để tránh xung đột
  localStorage.removeItem("foodieAdmin");
  sessionStorage.removeItem("foodieAdmin");

  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const usernameInput = document.getElementById("username");
      const passwordInput = document.getElementById("password");
      const btnLogin = document.getElementById("btn-login");

      const username = usernameInput.value.trim();
      const password = passwordInput.value.trim();

      // Validate cơ bản
      if (!username || !password) {
        showToast("Vui lòng nhập tên đăng nhập và mật khẩu!", "warning");
        return;
      }

      try {
        // Cập nhật trạng thái UI
        btnLogin.textContent = "Đang kiểm tra...";
        btnLogin.disabled = true;

        // Gọi API để lấy danh sách tài khoản
        const accounts = await accountAPI.layDanhSach();
        
        // Tìm tài khoản khớp với thông tin đăng nhập
        const account = accounts.find(
          (acc) => acc.username === username && acc.password === password
        );

        if (account) {
          showToast("Đăng nhập thành công!", "success");
          
          // Mã hóa thông tin thành chuỗi base64 để truyền an toàn qua URL
          const token = btoa(JSON.stringify({
            id: account.id,
            username: account.username,
            role: account.role || "admin"
          }));

          // Chuyển hướng sang admin.html kèm theo token
          setTimeout(() => {
            window.location.replace(`admin.html?token=${token}`);
          }, 1000);
        } else {
          showToast("Tên đăng nhập hoặc mật khẩu không đúng!", "error");
          btnLogin.textContent = "Đăng Nhập";
          btnLogin.disabled = false;
        }
      } catch (error) {
        showToast("Lỗi kết nối đến máy chủ!", "error");
        console.error("Lỗi đăng nhập:", error);
        btnLogin.textContent = "Đăng Nhập";
        btnLogin.disabled = false;
      }
    });
  }
});
