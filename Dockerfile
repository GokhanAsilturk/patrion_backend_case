FROM node:18-alpine

# Çalışma dizinini oluştur
WORKDIR /usr/src/app

# Paket dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm install

# Kaynak kodları kopyala
COPY . .

# TypeScript'i JavaScript'e derle
RUN npm run build

# Uygulama için gerekli portu aç
EXPOSE 3000

# Uygulamayı başlat
CMD ["npm", "start"] 