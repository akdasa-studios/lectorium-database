FROM node:22-alpine3.19 as builder
WORKDIR /akd-studios/lectorium/database/bootstrap
COPY . .
RUN npm install && npm run build


FROM node:22-alpine3.19 as release
WORKDIR /akd-studios/lectorium/database/bootstrap
COPY --from=builder /akd-studios/lectorium/database/bootstrap .
CMD ["npm", "run", "migrate"]
