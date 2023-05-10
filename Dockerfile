# Use an official Node.js runtime as a parent image
FROM node:alpine

# Set the working directory to /app
WORKDIR /app

# Copy the package.json and yarn.lock files to the container
COPY package.json yarn.lock tsconfig.json .env ./
# Install dependencies
RUN yarn install --production=false

# Copy the src directory as is
COPY src/ ./src/
COPY prisma/ ./prisma/

# Expose port 3000
EXPOSE 3000

# Start the application
CMD [ "yarn", "watch" ]
