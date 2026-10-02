# IELTS Workspace

Ứng dụng đọc và chỉnh sửa tài liệu Markdown trong trình duyệt với giao diện lấy cảm hứng từ GitHub.

## Chạy ứng dụng

### Docker

Cần Docker Desktop đang chạy. Trong thư mục dự án:

```sh
docker compose up -d --build
```

Mở **http://localhost:4173**. Docker cài Node.js và các thư viện trong container; không cần cài Node.js trên máy.

Thư mục dự án được gắn vào `/documents`, nên các thay đổi được lưu trực tiếp vào file `.md` trên máy và vẫn còn khi tạo lại container. Giao diện và mã ứng dụng được đóng gói riêng trong image. Sau khi sửa mã ứng dụng, chạy lại lệnh trên để build lại.

```sh
docker compose logs -f   # Xem log
docker compose down      # Dừng và gỡ container, giữ nguyên tài liệu
```

Nếu đã chạy bằng `npm start`, dừng tiến trình đó trước để giải phóng cổng 4173. Cổng Docker chỉ được mở trên máy cá nhân tại `127.0.0.1`.

### Chạy trực tiếp bằng Node.js

Cần Node.js và npm. Trong thư mục dự án, chạy:

```sh
npm install
npm start
```

Mở **http://localhost:4173**. Giữ terminal đang chạy; nhấn `Ctrl+C` để dừng.

## Sử dụng

- Chọn hoặc tìm file trong danh sách bên trái.
- **Preview** hiển thị Markdown đã định dạng; **Raw** hiển thị nội dung nguồn.
- **Chỉnh sửa** để sửa Markdown, sau đó bấm **Lưu thay đổi** để lưu trực tiếp vào file.
- **Hủy** bỏ thay đổi chưa lưu. Ứng dụng nhắc khi rời trang hoặc chuyển file còn thay đổi chưa lưu.
- Nút **◐** đổi giao diện sáng/tối.

Danh sách tự lấy các file `.md` ở thư mục gốc khi tải trang. Tải lại trang để cập nhật danh sách sau khi thêm file. Việc lưu không tự commit hoặc push lên GitHub; bạn có thể dùng Git như bình thường.

Ứng dụng chạy trên máy cá nhân, chỉ lắng nghe tại `127.0.0.1`. Nếu file đã thay đổi bên ngoài sau khi mở, ứng dụng từ chối ghi đè và báo tải lại. HTML nhúng trong Markdown được hiển thị như văn bản.
