FROM node:24-alpine

WORKDIR /app

# Включаем Corepack для yarn
RUN corepack enable

# Копируем package.json и yarn.lock
COPY package.json yarn.lock* ./

# Устанавливаем зависимости
RUN yarn install --frozen-lockfile --network-timeout 600000

# Открываем порт Vite dev server
EXPOSE 5173

# Запускаем dev server с явными флагами
CMD ["yarn", "vite", "--host", "0.0.0.0"]
