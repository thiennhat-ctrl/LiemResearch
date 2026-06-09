# Sử dụng môi trường Node.js bản nhẹ
FROM node:18-alpine

# Cài đặt pnpm theo chuẩn của dự án
RUN npm install -g pnpm

# Tạo thư mục làm việc bên trong container
WORKDIR /app

# Copy toàn bộ mã nguồn hiện tại vào trong Docker
COPY . .

# Cài đặt tất cả thư viện (cho cả frontend và backend)
RUN pnpm install --no-frozen-lockfile

# Khởi chạy dự án (chạy đồng thời cả frontend và backend)
CMD ["pnpm", "run", "dev"]