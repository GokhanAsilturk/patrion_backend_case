FROM node:18-alpine

# Çalışma dizinini ayarla
WORKDIR /app

# Package.json ve package-lock.json dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm ci --only=production

# Projeyi kopyala
COPY . .

# TypeScript dosyalarını JavaScript'e dönüştür
RUN npm run build

# Uygulamayı çalıştır
CMD ["npm", "start"]

# Port ayarları
EXPOSE 3000 