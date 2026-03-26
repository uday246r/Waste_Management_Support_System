# Step 1: Tell Docker what base image to use
# We use Node.js version 20 (alpine is a super lightweight Linux version)
FROM node:20-alpine

# Step 2: Set the working directory inside the container
# This is where all our project files will live inside Docker
WORKDIR /usr/src/app

# Step 3: Copy only the package.json and package-lock.json first
# We do this before copying the rest of the code because Docker caches layers
# This means if you change a JS file, Docker won't need to reinstall all dependencies!
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the application code
# This copies everything from your local directory to the Docker container
# (except what is in .dockerignore!)
COPY . .

# Step 6: Expose the port your app runs on
# This is mostly for documentation to let others know what port the app listens on
EXPOSE 4000

# Step 7: The command to start the application when the container runs
CMD ["npm", "start"]
