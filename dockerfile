FROM node:10-slim
COPY sfo-flight-data.js .
COPY package.json .
RUN npm install 
CMD ["node", "sfo-flight-data.js"]
