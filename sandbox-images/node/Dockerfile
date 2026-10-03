FROM node:22-bookworm

WORKDIR /workspace

RUN apt-get update \
    && apt-get install -y --no-install-recommends git \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=development

CMD ["sleep", "infinity"]