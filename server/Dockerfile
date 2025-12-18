# Use the official lightweight Node.js image
FROM node:20-slim

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image
COPY package*.json ./

# Install production dependencies
RUN npm install

# Copy local code to the container image
COPY . .

# Build the project (if using TypeScript)
RUN npm run build

# Service must listen on port 8080
EXPOSE 8080

# Run the web service on container startup
CMD [ "node", "dist/index.js" ]