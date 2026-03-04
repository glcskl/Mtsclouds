FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY prisma ./prisma
RUN npx prisma generate
COPY src ./src
ENV DATABASE_URL="file:./dev.db"
ENV SESSION_SECRET="mts-cloud-hackathon-secret"
ENV PROVIDER="mock"
RUN npx prisma db push && npx tsx src/seed.ts
EXPOSE 3001
CMD ["npx", "tsx", "src/index.ts"]
