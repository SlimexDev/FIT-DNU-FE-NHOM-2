Bạn là senior frontend developer, chuyên xây dựng dự án vanilla JS đẹp và chuyên nghiệp.

### **Tên dự án:** FoodieMenu

**Mô tả:**  
Xây dựng website quản lý thực đơn nhà hàng phong cách **Modern + Liquid Glass (Glassmorphism)** lấy cảm hứng từ Apple. Giao diện sạch, sang trọng, trong suốt, hiệu ứng blur, shadow nhẹ, gradient tinh tế.

---

### **Cấu trúc thư mục bắt buộc (giữ nguyên):**
btl-FoodieMenu/
├── css/
│   └── style.css
├── img/
├── js/
│   ├── admin.js
│   ├── api.js
│   ├── main.js
│   └── utils.js
├── admin.html
├── index.html
└── README.md
---

### **YÊU CẦU KỸ THUẬT BẮT BUỘC**

**1. JavaScript thuần** (điểm tối đa):
- Ít nhất 3 hàm tự định nghĩa có tham số và return
- Sử dụng if/else, for, while
- Xử lý sự kiện DOM đầy đủ
- DOM manipulation mạnh (innerHTML, classList, appendChild, dataset...)

**2. API (Quan trọng):**
- Sử dụng **class APIResource** đã có trong file api.js
- Base URL: `https://69f9a797c509a40d3aa2f26f.mockapi.io/api/v1/`
- Resource chính: **`products`**
- Resource phụ (nâng cao): **`categories`** (nếu có thể)

**Các trường của products:**
- `id`, `name`, `price`, `category`, `image`, `description`, `stock`, `createdAt`

**3. Form Validation** (chi tiết):
- Kiểm tra required fields
- Price > 0, stock ≥ 0, name không rỗng, image là URL hợp lệ
- Hiển thị lỗi inline ngay dưới input
- Ngăn submit form khi có lỗi

**4. Giao diện - Liquid Glass Style (Apple-inspired):**
- Thiết kế **Glassmorphism**: background blur, backdrop-filter, transparency, border nhẹ
- Màu chủ đạo: gradient tím - hồng - xanh dương nhạt, dark/light mode tinh tế
- Card có hiệu ứng hover scale + glass shine
- Typography hiện đại, sạch
- Responsive hoàn hảo (mobile first)
- Animation mượt mà (transition, keyframes)

---

### **TÍNH NĂNG CẦN THỰC HIỆN**

#### **Trang Public (index.html)**
- Hero banner đẹp với tiêu đề "FoodieMenu"
- Thanh tìm kiếm + filter theo category + filter giá
- Danh sách món ăn dạng **Glass Card**
- Hiển thị stock (còn bao nhiêu món)
- Badge "Hết hàng" khi stock = 0
- Click vào card → mở **Modal chi tiết** (glass style)

#### **Trang Admin (admin.html)**
- Dashboard quản lý sản phẩm
- Form thêm/sửa món ăn (với preview ảnh)
- Bảng danh sách sản phẩm có thể edit & delete
- Quản lý danh mục (nếu dùng resource categories)

---

### **Nhiệm vụ của bạn:**

Hãy **xây dựng từng file một**, bắt đầu từ:

1. `js/api.js` — Cập nhật class APIResource để phù hợp với `products` và `categories`
2. `js/utils.js` — Các hàm hỗ trợ (formatPrice, showToast, validateForm, glass loading spinner...)
3. `css/style.css` — Viết CSS Glassmorphism đẹp, hiện đại
4. `index.html` + `main.js`
5. `admin.html` + `admin.js`

**Khi code hãy:**
- Comment rõ ràng bằng tiếng Việt
- Viết code sạch, có cấu trúc
- Sử dụng async/await kết hợp .then khi cần
- Tối ưu UX/UI theo phong cách Liquid Glass

Bắt đầu ngay bằng việc tạo **file js/api.js** hoàn chỉnh trước, sau đó làm tiếp các file khác theo thứ tự.
