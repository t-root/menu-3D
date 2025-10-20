# 🌌 Menu3D – Interactive 3D Menu Carousel

**Menu3D** is an interactive 3D rotating menu built using **HTML + JavaScript**, displaying pages or content blocks in a 3D circular layout.

---

## 🚀 Features
- Auto and manual 3D rotation.
- Pause on hover or focus.
- Right-click to open/hide menu.
- Configurable via `config.json` (size, speed, rotation, number of items...).
- Each menu item can display an **iframe** or embedded content.

---

## 📂 Project Structure
```
menu3D/
├── index.html
├── script.js
├── config.json
└── README.md
```

---

## ⚙️ How to Run
1. Place the `menu3D` folder in your web server (Flask, XAMPP, or Live Server).
2. Open in browser:
   ```
   http://localhost:5000/menu3D/index.html
   ```
3. The menu rotates automatically. Right-click to toggle visibility.

---

## 🧩 config.json Example
```json
{
  "perspective": 1000,
  "radius": 500,
  "autoRotateSpeed": 0.2,
  "scrollRotateSpeed": 4,
  "timeAuto": 3000,
  "itemWidth": 400,
  "itemHeight": 550,
  "indexUp": 100,
  "items": [
    { "path": "http://0.0.0.0:5000/slider_3d/index.html", "title": "Page1" },
    { "path": "http://0.0.0.0:5000/slider_3d/index.html", "title": "Page2" },
    { "path": "http://0.0.0.0:5000/slider_3d/index.html", "title": "Page3" },
    { "path": "http://0.0.0.0:5000/slider_3d/index.html", "title": "Page4" },
    { "path": "http://0.0.0.0:5000/slider_3d/index.html", "title": "Page5" },
    { "path": "http://0.0.0.0:5000/slider_3d/index.html", "title": "Page6" }
  ]
}
```

---

## 🖱️ Usage
- **Right-click once** → show/hide the 3D menu.  
- **Double right-click** → open browser context menu.  
- **Drag left-click** → rotate manually.  
- **Scroll** → rotate faster.  
- **Hover or focus** → pause auto-rotation.

---

## 💡 Notes
- When hidden, `z-index = -1`. When visible, use `indexUp` from config.  
- All items are evenly spaced around the Y-axis forming a 3D cylinder.  
- Can be embedded easily in any web app.

---

## 🧠 Author
**T-Root**  
📧 GitHub: [https://github.com/t-root](https://github.com/t-root)

---
---

# 🌌 Menu3D – Hiệu ứng menu xoay 3D tương tác

**Menu3D** là một hiệu ứng menu xoay 3D được viết bằng **HTML + JavaScript**, hiển thị các trang hoặc nội dung khác trong các khối 3D xoay tròn.

---

## 🚀 Tính năng
- Hiệu ứng xoay 3D tự động và bằng chuột.
- Dừng xoay khi rê chuột hoặc focus vào item.
- Hỗ trợ mở menu bằng **chuột phải (Right click)** và ẩn khi nhấn lại.
- Dễ dàng cấu hình qua file `config.json` (kích thước, tốc độ, góc quay, số lượng item...).
- Mỗi mục có thể là **iframe** hiển thị trang web hoặc nội dung khác.

---

## 📂 Cấu trúc dự án
```
menu3D/
├── index.html
├── script.js        # Code chính xử lý hiệu ứng 3D và sự kiện
├── config.json      # File cấu hình cho menu (vị trí, tốc độ, danh sách item)
└── README.md        # Tài liệu hướng dẫn
```

---

## ⚙️ Cách chạy
1. Đặt toàn bộ thư mục `menu3D` vào thư mục web server (VD: Flask, XAMPP, hoặc dùng Live Server trong VSCode).  
2. Mở trình duyệt và truy cập:
   ```
   http://localhost:5000/menu3D/index.html
   ```
3. Menu sẽ tự động xoay, nhấn chuột phải để bật/tắt menu.

---

## 🧩 Cấu hình `config.json`
```json
{
  "perspective": 1000,
  "radius": 500,
  "autoRotateSpeed": 0.2,
  "scrollRotateSpeed": 4,
  "timeAuto": 3000,
  "itemWidth": 400,
  "itemHeight": 550,
  "indexUp": 100,
  "items": [
    { "path": "http://0.0.0.0:5000/slider_3d/index.html", "title": "Page1" },
    { "path": "http://0.0.0.0:5000/slider_3d/index.html", "title": "Page2" },
    { "path": "http://0.0.0.0:5000/slider_3d/index.html", "title": "Page3" },
    { "path": "http://0.0.0.0:5000/slider_3d/index.html", "title": "Page4" },
    { "path": "http://0.0.0.0:5000/slider_3d/index.html", "title": "Page5" },
    { "path": "http://0.0.0.0:5000/slider_3d/index.html", "title": "Page6" }
  ]
}
```
> 🔹 Có thể chỉnh các thông số để thay đổi góc nhìn, kích thước, tốc độ xoay.  
> 🔹 Mỗi mục trong `items` là một khối 3D hiển thị nội dung từ `path`.

---

## 🖱️ Cách sử dụng
- **Chuột phải 1 lần** → mở hoặc ẩn menu 3D.  
- **Chuột phải 2 lần liên tiếp (double click)** → hiển thị menu chuột mặc định của trình duyệt.  
- **Giữ chuột trái và kéo** → xoay thủ công không gian 3D.  
- **Cuộn chuột (scroll)** → xoay nhanh theo hướng cuộn.  
- **Rê chuột hoặc focus vào item** → tạm dừng xoay tự động.

---

## 💡 Ghi chú
- Khi menu ẩn, `z-index = -1`. Khi mở, `z-index` lấy từ giá trị `indexUp` trong `config.json`.  
- Tất cả item nằm đều nhau quanh trục Y tạo thành hình trụ xoay 3D.  
- Có thể nhúng vào bất kỳ website nào chỉ với `script.js` và `config.json`.

---

## 🧠 Tác giả
**T-Root**  
📧 GitHub: [https://github.com/trungtq-root](https://github.com/t-root)
