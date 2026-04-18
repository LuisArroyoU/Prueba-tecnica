# Usa una imagen oficial ligera de Node
FROM node:18-alpine

# Establece el directorio de trabajo
WORKDIR /usr/src/app

# Copia los archivos de configuración
COPY package*.json ./

# Instala todas las dependencias
RUN npm install

# Copia el código fuente original
COPY . .

# Expone el puerto del backend
EXPOSE 3000

# Arranca directamente el servidor (evitando nodemon en Docker para ahorro de memoria)
CMD [ "npm", "start" ]
