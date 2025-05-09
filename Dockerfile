FROM node:20-alpine as build

WORKDIR /app

# Копируем конфигурационные файлы
COPY package.json package-lock.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Используем nginx для раздачи статических файлов
FROM nginx:stable-alpine

# Копируем собранное приложение
COPY --from=build /app/dist /usr/share/nginx/html

# Открываем порт
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"] 