# ---------- Build Stage ----------
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the React application
RUN npm run build

# ---------- Production Stage ----------
FROM nginx:1.27-alpine

# Remove default Nginx files
RUN rm -rf /usr/share/nginx/html/*

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]