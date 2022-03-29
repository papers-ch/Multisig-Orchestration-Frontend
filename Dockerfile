FROM node:16 as angular-build

# See https://crbug.com/795759
RUN apt-get update && apt-get install -yq libgconf-2-4 bzip2 build-essential libxtst6
RUN apt-get install -yq git

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
# installs, work.
RUN apt-get update && apt-get install -y wget --no-install-recommends \
  && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst libglu1 libxss1 \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/* \
  && apt-get purge --auto-remove -y curl \
  && rm -rf /src/*.deb

RUN mkdir /app
WORKDIR /app

# install dependencies
ADD package.json /app/package.json
ADD yarn.lock /app/yarn.lock
ADD .yarn /app/.yarn

RUN yarn config set unsafe-perm true
RUN yarn install --frozen-lockfile

ENV NODE_ENV production

# copy src
COPY . /app/

# post-install hook, to be safe if it got cached
RUN node config/patch_crypto.js

ARG RUN_ENV

# compile to check for errors
RUN yarn build --configuration=${RUN_ENV}

###################################

FROM nginx:1-alpine

COPY --from=angular-build /app/dist/dapp-frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD [ "nginx", "-g", "daemon off;" ]
