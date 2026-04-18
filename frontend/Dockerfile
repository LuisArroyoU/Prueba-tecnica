# ===============================
# FASE 1: Construcción (Builder)
# ===============================
FROM node:18-alpine as build-stage

WORKDIR /app

# Instalar dependencias puras
COPY package*.json ./
RUN npm install

# Copiar todo el código fuente y compilar a HTML/CSS/JS puros en /dist
COPY . .
RUN npm run build

# ===============================
# FASE 2: Servidor Web (Nginx)
# ===============================
FROM nginx:alpine as production-stage

# Copiar los estáticos pesados de Vue de la fase 1 al servidor Web
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Exponer el puerto interno 80 (Se traducirá al 5173 vía docker-compose)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
