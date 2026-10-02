# GIA PHẢ HỌ PHẠM VĂN — gói Cloudflare

Tệp `GIA-PHA-HO-PHAM-VAN-cloudflare-final.zip` là gói triển khai cuối cùng. Mỗi lần chạy `npm run package:cloudflare-final`, tệp này được cập nhật đè tại đúng vị trí đó.

Ứng dụng có API đăng nhập và cơ sở dữ liệu nên phải được triển khai bằng **Cloudflare Workers**, không phải Pages tĩnh.

## Triển khai

1. Giải nén tệp ZIP và mở Terminal tại thư mục `GIA-PHA-HO-PHAM-VAN-CLOUDFLARE`.
2. Đăng nhập Cloudflare: `npx wrangler login`.
3. Tạo D1: `npx wrangler d1 create gia-pha-ho-pham-van`.
4. Sao chép `database_id` trả về, sau đó thay `REPLACE_WITH_YOUR_D1_DATABASE_ID` trong `wrangler.jsonc`. Nếu dùng tên D1 khác, cập nhật thêm `database_name`.
5. Tạo cấu trúc dữ liệu: `npx wrangler d1 migrations apply gia-pha-ho-pham-van --remote --config wrangler.jsonc`.
6. Đặt mật khẩu cho tài khoản quản trị mặc định: `npx wrangler secret put DEFAULT_ADMIN_PASSWORD --config wrangler.jsonc`.
7. Kiểm tra cấu hình: `npx wrangler check --config wrangler.jsonc`.
8. Xuất bản: `npx wrangler deploy --config wrangler.jsonc`.

Không lưu mật khẩu, khóa API hoặc `database_id` thật trong tệp ZIP. Sau lần triển khai đầu tiên, mở ứng dụng để tạo dữ liệu và tài khoản nội bộ.
