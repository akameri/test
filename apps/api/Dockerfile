FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/
RUN npm install --workspace apps/api --include-workspace-root=false
COPY apps/api apps/api
RUN cd apps/api && npx prisma generate && npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/apps/api/node_modules apps/api/node_modules
COPY --from=build /app/apps/api/dist apps/api/dist
COPY --from=build /app/apps/api/prisma apps/api/prisma
COPY --from=build /app/apps/api/package.json apps/api/
WORKDIR /app/apps/api
EXPOSE 4000
# Schema anwenden + Katalog seeden, dann API starten
CMD ["sh", "-c", "npx prisma db push --skip-generate && npx ts-node --transpile-only prisma/seed.ts || true && node dist/main.js"]
