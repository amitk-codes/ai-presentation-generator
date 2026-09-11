FROM node:20-bookworm-slim

WORKDIR /app

COPY package.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src

ENV NODE_ENV=production
ENV PORT=7000

EXPOSE 7000
CMD ["npm", "start"]
