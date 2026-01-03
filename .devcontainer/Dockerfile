# Node.js & TypeScript Development Container
# Base: Ubuntu 24.04 LTS (Noble) with Node.js 22.x

FROM ubuntu:24.04

# Install basic dependencies and Node.js 22.x
RUN apt-get update && apt-get upgrade -y && export DEBIAN_FRONTEND=noninteractive \
  && apt-get -y install --no-install-recommends \
  ca-certificates \
  curl \
  unzip \
  git \
  sudo \
  postgresql-client \
  gnupg2 \
  && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
  && apt-get install -y nodejs \
  && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m -s /bin/bash node \
  && usermod -aG sudo node \
  && echo "node ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/node \
  && chmod 0440 /etc/sudoers.d/node

# Switch to node user
USER node

# Install Bun (optional)
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/home/node/.bun/bin:${PATH}"
