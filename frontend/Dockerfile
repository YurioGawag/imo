# React app image
FROM node:lts-alpine as build

WORKDIR /app

# 📦 Kopiere ALLES auf einmal
COPY . .

# 📥 Installiere Dependencies
RUN npm install

# 🏗️ Baue das React-Frontend
RUN npm run build

# 🌐 Production-Image mit nginx
FROM nginx:latest as prod

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80/tcp

CMD ["/usr/sbin/nginx", "-g", "daemon off;"]
