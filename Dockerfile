# 
# Build stage 1.
# This state builds our TypeScript and produces an intermediate Docker image containing the compiled JavaScript code.
#

ARG image=node:12.13.0-alpine
ARG PORT=8000

FROM $image AS Build
MAINTAINER Aakarui / Mohan Bhandari
WORKDIR /usr/src/app
COPY  . .
RUN npm install
RUN npm run build

#
# Build stage 2.
# This stage pulls the compiled JavaScript code from the stage 1 intermediate image.
# This stage builds the final Docker image that we'll use in production.
#
FROM $image

WORKDIR /usr/src/app
COPY package.json ./
RUN npm install --only=production
COPY --from=Build /usr/src/app/dist ./dist
COPY --from=Build /usr/src/app/tsconfig* ./
EXPOSE $PORT
CMD npm start