# Menu3D - Hướng dẫn sử dụng

## Giới thiệu

Menu3D là một thư viện JavaScript tạo menu 3D carousel tương tác, cho phép hiển thị các trang web trong một không gian 3D có thể xoay và điều hướng. Script tự động detect đường dẫn và không cần cấu hình phức tạp.

## Cấu trúc thư mục

```
main/
├── index.js          # Script chính (chứa cả CSS)
├── config.json       # File cấu hình
├── icon/             # Thư mục chứa icon
│   ├── close.png     # Icon khi menu đóng
│   └── open.png      # Icon khi menu mở 
```

## Cách sử dụng cơ bản

### 1. Tích hợp vào HTML

Thêm script vào file HTML của bạn:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Page</title>
</head>
<body>
    <!-- Nút toggle menu (tùy chọn, script sẽ tự tạo nếu không có) -->
    <h1>My Page</h1>
    
    <!-- Gọi script -->
    <script src="/main/index.js"></script>
</body>
</html>
```

### 2. Cấu trúc thư mục

Script sẽ tự động detect đường dẫn dựa trên vị trí file `index.js`. Đảm bảo cấu trúc như sau:

```
project-root/
├── main/
│   ├── index.js
│   ├── config.json
│   └── icon/
│       ├── close.png
│       └── open.png
└── your-page.html
```

### 3. Tính năng tự động

- **Tự động detect đường dẫn**: Script tự tìm đường dẫn đến `config.json` và icon dựa trên vị trí file `index.js`
- **Responsive**: Tự động chuyển đổi giữa desktop và mobile mode
- **CSS tích hợp**: Không cần file CSS riêng, tất cả đã được embed trong JS

## Chi tiết về config.json

### Cấu trúc file config.json

```json
{
    "breakpoint": 700,
    "cameraOffset": 0,
    "autoRotateSpeed": 0.2,
    "scrollRotateSpeed": 4,
    "indexUp": 100,
    "timeAuto": 3000,
    "desktop": { ... },
    "mobile": { ... },
    "iconClosed": "close.png",
    "iconOpen": "open.png",
    "items": [ ... ]
}
```

### Các thuộc tính cấu hình

#### Thuộc tính chung

- **`breakpoint`** (number): Độ rộng màn hình (px) để chuyển giữa desktop và mobile mode. Mặc định: `700`
- **`cameraOffset`** (number): Offset của camera (vw). Giá trị âm = camera gần hơn, dương = camera xa hơn. Mặc định: `0`
- **`autoRotateSpeed`** (number): Tốc độ tự động xoay (độ/frame). Mặc định: `0.2`
- **`scrollRotateSpeed`** (number): Tốc độ xoay khi scroll (độ). Mặc định: `4`
- **`indexUp`** (number): Z-index cơ sở cho menu. Mặc định: `100`
- **`timeAuto`** (number): Thời gian (ms) trước khi tiếp tục auto-rotate sau khi tương tác. Mặc định: `3000`

#### Cấu hình Desktop

```json
"desktop": {
    "perspective": 55,      // Độ sâu 3D (vw)
    "radius": 26,           // Bán kính vòng tròn (vw)
    "itemWidth": 15,        // Chiều rộng item (vw)
    "itemHeight": 22,       // Chiều cao item (vw)
    "toggleSize": 4         // Kích thước nút toggle (vw)
}
```

#### Cấu hình Mobile

```json
"mobile": {
    "perspective": 70,
    "radius": 50,
    "itemWidth": 30,
    "itemHeight": 50,
    "toggleSize": 15
}
```

### Cấu hình Icon ⭐

**Quan trọng**: Script tự động detect đường dẫn icon dựa trên vị trí file `index.js`.

#### Cách cấu hình icon

Trong `config.json`, chỉ cần khai báo **tên file** icon:

```json
{
    "iconClosed": "close.png",
    "iconOpen": "open.png"
}
```

#### Cách hoạt động

1. Script tự động tìm đường dẫn của file `index.js` đang chạy
2. Tự động thêm `basePath + 'icon/'` vào trước tên file
3. Ví dụ: Nếu `index.js` ở `/main/index.js`, icon sẽ được load từ `/main/icon/close.png`

#### Yêu cầu

- Đặt icon trong thư mục `icon/` cùng cấp với `index.js`
- Tên file phải khớp chính xác với giá trị trong `config.json` (phân biệt hoa/thường)
- Hỗ trợ các định dạng: PNG, JPG, SVG, GIF

#### Ví dụ cấu trúc

```
main/
├── index.js
├── config.json
└── icon/
    ├── close.png    ← iconClosed
    └── open.png     ← iconOpen
```

### Cấu hình Items (Menu items)

```json
"items": [
    {
        "path": "/example/page/page1.html",  // Đường dẫn đến trang
        "title": "Page1"                      // Tiêu đề hiển thị (tùy chọn)
    },
    {
        "path": "/example/page/page2.html",
        "title": "Page2"
    }
]
```

- **`path`** (string, bắt buộc): Đường dẫn đến trang web sẽ hiển thị trong iframe
- **`title`** (string, tùy chọn): Tiêu đề hiển thị dưới mỗi item. Nếu không có, sẽ không hiển thị label

## Thư mục Example

### Mục đích

Thư mục `example/` chứa code demo và ví dụ sử dụng Menu3D, giúp bạn:
- Hiểu cách tích hợp Menu3D vào project
- Xem cách cấu hình `config.json`
- Test và phát triển tính năng mới

### Cấu trúc Example

```
example/
├── index.html        # Trang demo chính
├── server.js         # Server đơn giản để chạy demo
└── page/             # Các trang demo
    ├── page1.html
    ├── page2.html
    ├── page3.html
    ├── page4.html
    ├── page5.html
    ├── page6.html
    ├── page7.html
    └── matrix-config.js
```

### Cách sử dụng Example

#### 1. Chạy server demo

```bash
# Di chuyển vào thư mục example
cd example

# Chạy server (Node.js)
node server.js
```

Server sẽ chạy tại: `http://localhost:8080`

#### 2. Truy cập demo

Mở trình duyệt và truy cập: `http://localhost:8080`

#### 3. Cách hoạt động

- **`example/index.html`**: Trang chính load script từ `/main/index.js`
- **`example/page/*.html`**: Các trang demo được hiển thị trong menu 3D
- **`example/server.js`**: Server đơn giản serve file tĩnh từ root project

#### 4. Tùy chỉnh Example

Bạn có thể:
- Sửa `example/index.html` để thay đổi giao diện demo
- Thêm/xóa/sửa các trang trong `example/page/`
- Cập nhật `main/config.json` để thay đổi danh sách items

#### 5. Lưu ý khi sử dụng Example

- Server serve từ **root project** (thư mục cha của `example/`)
- Đường dẫn trong `config.json` phải là đường dẫn tuyệt đối từ root
- Ví dụ: `/example/page/page1.html` (không phải `example/page/page1.html`)

## Tính năng tương tác

### Điều khiển menu

- **Click nút toggle**: Mở/đóng menu 3D
- **Drag menu**: Kéo để xoay menu
- **Scroll**: Cuộn chuột để xoay nhanh
- **Hover**: Di chuột vào item để tạm dừng auto-rotate
- **ESC**: Nhấn ESC để đóng menu
- **Drag nút toggle**: Kéo nút toggle để di chuyển vị trí (tự động snap về góc gần nhất)

### Responsive

Menu tự động chuyển đổi giữa desktop và mobile mode dựa trên `breakpoint`:
- **Desktop**: Hiển thị với cấu hình trong `desktop`
- **Mobile**: Hiển thị với cấu hình trong `mobile`

## Lưu ý quan trọng

1. **Đường dẫn tương đối**: Script tự động detect đường dẫn, nhưng đảm bảo cấu trúc thư mục đúng
2. **Icon path**: Chỉ cần tên file trong `config.json`, script sẽ tự thêm đường dẫn
3. **CORS**: Nếu load trang từ domain khác, đảm bảo CORS được cấu hình đúng
4. **Performance**: Menu sử dụng CSS 3D transforms, đảm bảo trình duyệt hỗ trợ

## Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra console browser để xem lỗi
2. Đảm bảo đường dẫn đến `config.json` và icon đúng
3. Kiểm tra cấu trúc JSON trong `config.json` có hợp lệ không
4. Xem ví dụ trong thư mục `example/` để so sánh

---

# Menu3D - User Guide  

## Introduction

Menu3D is a JavaScript library that creates an interactive 3D carousel menu, allowing you to display web pages in a rotatable and navigable 3D space. The script automatically detects paths and requires no complex configuration.

## Directory Structure

```
main/
├── index.js          # Main script (includes CSS)
├── config.json       # Configuration file
├── icon/             # Icon directory
│   ├── close.png     # Icon when menu is closed
│   └── open.png      # Icon when menu is open
```

## Basic Usage

### 1. Integration into HTML

Add the script to your HTML file:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Page</title>
</head>
<body>
    <!-- Toggle button (optional, script will create if not present) -->
    <h1>My Page</h1>
    
    <!-- Load script -->
    <script src="/main/index.js"></script>
</body>
</html>
```

### 2. Directory Structure

The script automatically detects paths based on the location of `index.js`. Ensure the following structure:

```
project-root/
├── main/
│   ├── index.js
│   ├── config.json
│   └── icon/
│       ├── close.png
│       └── open.png
└── your-page.html
```

### 3. Automatic Features

- **Auto path detection**: Script automatically finds paths to `config.json` and icons based on `index.js` location
- **Responsive**: Automatically switches between desktop and mobile modes
- **Embedded CSS**: No separate CSS file needed, everything is embedded in JS

## config.json Details

### config.json File Structure

```json
{
    "breakpoint": 700,
    "cameraOffset": 0,
    "autoRotateSpeed": 0.2,
    "scrollRotateSpeed": 4,
    "indexUp": 100,
    "timeAuto": 3000,
    "desktop": { ... },
    "mobile": { ... },
    "iconClosed": "close.png",
    "iconOpen": "open.png",
    "items": [ ... ]
}
```

### Configuration Properties

#### General Properties

- **`breakpoint`** (number): Screen width (px) to switch between desktop and mobile mode. Default: `700`
- **`cameraOffset`** (number): Camera offset (vw). Negative values = camera closer, positive = camera farther. Default: `0`
- **`autoRotateSpeed`** (number): Auto rotation speed (degrees/frame). Default: `0.2`
- **`scrollRotateSpeed`** (number): Rotation speed when scrolling (degrees). Default: `4`
- **`indexUp`** (number): Base z-index for menu. Default: `100`
- **`timeAuto`** (number): Time (ms) before resuming auto-rotate after interaction. Default: `3000`

#### Desktop Configuration

```json
"desktop": {
    "perspective": 55,      // 3D depth (vw)
    "radius": 26,           // Circle radius (vw)
    "itemWidth": 15,        // Item width (vw)
    "itemHeight": 22,       // Item height (vw)
    "toggleSize": 4         // Toggle button size (vw)
}
```

#### Mobile Configuration

```json
"mobile": {
    "perspective": 70,
    "radius": 50,
    "itemWidth": 30,
    "itemHeight": 50,
    "toggleSize": 15
}
```

### Icon Configuration ⭐

**Important**: The script automatically detects icon paths based on the `index.js` file location.

#### How to Configure Icons

In `config.json`, you only need to declare the **filename**:

```json
{
    "iconClosed": "close.png",
    "iconOpen": "open.png"
}
```

#### How It Works

1. Script automatically finds the path of the running `index.js` file
2. Automatically prepends `basePath + 'icon/'` to the filename
3. Example: If `index.js` is at `/main/index.js`, icons will be loaded from `/main/icon/close.png`

#### Requirements

- Place icons in the `icon/` folder at the same level as `index.js`
- Filename must exactly match the value in `config.json` (case-sensitive)
- Supported formats: PNG, JPG, SVG, GIF

#### Example Structure

```
main/
├── index.js
├── config.json
└── icon/
    ├── close.png    ← iconClosed
    └── open.png     ← iconOpen
```

### Items Configuration (Menu items)

```json
"items": [
    {
        "path": "/example/page/page1.html",  // Path to the page
        "title": "Page1"                      // Display title (optional)
    },
    {
        "path": "/example/page/page2.html",
        "title": "Page2"
    }
]
```

- **`path`** (string, required): Path to the web page that will be displayed in the iframe
- **`title`** (string, optional): Title displayed below each item. If not provided, no label will be shown

## Example Directory

### Purpose

The `example/` directory contains demo code and usage examples for Menu3D, helping you:
- Understand how to integrate Menu3D into your project
- See how to configure `config.json`
- Test and develop new features

### Example Structure

```
example/
├── index.html        # Main demo page
├── server.js         # Simple server to run demo
└── page/             # Demo pages
    ├── page1.html
    ├── page2.html
    ├── page3.html
    ├── page4.html
    ├── page5.html
    ├── page6.html
    ├── page7.html
    └── matrix-config.js
```

### How to Use Example

#### 1. Run Demo Server

```bash
# Navigate to example directory
cd example

# Run server (Node.js)
node server.js
```

Server will run at: `http://localhost:8080`

#### 2. Access Demo

Open your browser and visit: `http://localhost:8080`

#### 3. How It Works

- **`example/index.html`**: Main page loads script from `/main/index.js`
- **`example/page/*.html`**: Demo pages displayed in the 3D menu
- **`example/server.js`**: Simple server that serves static files from project root

#### 4. Customize Example

You can:
- Edit `example/index.html` to change the demo interface
- Add/remove/edit pages in `example/page/`
- Update `main/config.json` to change the items list

#### 5. Notes When Using Example

- Server serves from **project root** (parent directory of `example/`)
- Paths in `config.json` must be absolute paths from root
- Example: `/example/page/page1.html` (not `example/page/page1.html`)

## Interactive Features

### Menu Controls

- **Click toggle button**: Open/close 3D menu
- **Drag menu**: Drag to rotate menu
- **Scroll**: Scroll mouse to rotate quickly
- **Hover**: Hover over item to pause auto-rotate
- **ESC**: Press ESC to close menu
- **Drag toggle button**: Drag toggle button to move position (automatically snaps to nearest edge)

### Responsive

Menu automatically switches between desktop and mobile modes based on `breakpoint`:
- **Desktop**: Displays with configuration in `desktop`
- **Mobile**: Displays with configuration in `mobile`

## Important Notes

1. **Relative paths**: Script automatically detects paths, but ensure correct directory structure
2. **Icon path**: Only filename needed in `config.json`, script will automatically add path
3. **CORS**: If loading pages from different domains, ensure CORS is properly configured
4. **Performance**: Menu uses CSS 3D transforms, ensure browser support

## Support

If you encounter issues:
1. Check browser console for errors
2. Ensure paths to `config.json` and icons are correct
3. Verify JSON structure in `config.json` is valid
4. Check examples in `example/` directory for comparison
