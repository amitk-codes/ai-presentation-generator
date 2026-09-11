FROM node:20-bookworm

WORKDIR /app

# Install dependencies first for better layer caching.
COPY package.json ./
RUN npm install

# Install Chromium + the OS libraries Playwright needs (matches installed version).
RUN npx playwright install --with-deps chromium

# App source.
COPY tsconfig.json ./
COPY src ./src

ENV NODE_ENV=production
ENV PORT=4000
ENV OUTPUT_DIR=/app/output

EXPOSE 4000
CMD ["npm", "start"]
