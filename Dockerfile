# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy source files
COPY . .

# Build the project
RUN npm run build

# Install PM2 globally
RUN npm install pm2 -g

# Expose the application port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production

# Use PM2 to run the app
CMD ["pm2-runtime", "ecosystem.config.js", "--env", "production"]
