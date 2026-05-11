# Billiard_management

Hệ thống quản lý quán bida được xây dựng theo hướng web app, tập trung vào quản lý bàn, menu, đơn hàng, thanh toán, giao dịch, báo cáo và phân quyền người dùng.

## Tính năng chính

- Trang dashboard cho admin và nhân sự vận hành.
- Quản lý bàn chơi, trạng thái bàn và chi tiết từng bàn.
- Quản lý menu, đơn hàng và luồng thanh toán.
- Theo dõi giao dịch, báo cáo và thống kê.
- Phân quyền theo vai trò như `ADMIN`, `MANAGER`, `CASHIER`.

## Công nghệ

- React 19
- TypeScript
- Vite
- React Router
- TanStack Query
- Tailwind CSS
- shadcn/ui
- Recharts
- Dayjs

## Cấu trúc dự án

- `fe/`: mã nguồn frontend.
- `docs-plan/`: tài liệu kế hoạch và mô tả cấu trúc dự án.
- `docker-compose.yml`: cấu hình chạy frontend bằng Docker.

## Cài đặt và chạy

### Chạy local

```bash
cd fe
npm install
npm run dev
```

Ứng dụng sẽ chạy ở `http://localhost:5173`.

### Chạy bằng Docker

```bash
docker compose up --build
```

## Script hữu ích

- `npm run dev`: chạy môi trường phát triển.
- `npm run build`: build ứng dụng.
- `npm run lint`: kiểm tra lint.
- `npm run preview`: xem bản build.