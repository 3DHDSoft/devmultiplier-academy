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
  # Playwright core dependencies
  libxcb-shm0 \
  libx11-xcb1 \
  libx11-6 \
  libxcb1 \
  libxext6 \
  libxrandr2 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxfixes3 \
  libxi6 \
  libgtk-3-0t64 \
  libpangocairo-1.0-0 \
  libpango-1.0-0 \
  libatk1.0-0t64 \
  libcairo-gobject2 \
  libcairo2 \
  libgdk-pixbuf-2.0-0 \
  libglib2.0-0t64 \
  libxrender1 \
  libasound2t64 \
  libfreetype6 \
  libfontconfig1 \
  libdbus-1-3 \
  # Playwright additional dependencies (Webkit, Firefox, Chromium)
  libgtk-4-1 \
  libgraphene-1.0-0 \
  libvulkan1 \
  libatomic1 \
  libxslt1.1 \
  libwoff1 \
  libvpx9 \
  libevent-2.1-7t64 \
  libopus0 \
  libgstreamer1.0-0 \
  libgstreamer-plugins-base1.0-0 \
  libgstreamer-plugins-bad1.0-0 \
  libgstreamer-gl1.0-0 \
  gstreamer1.0-libav \
  gstreamer1.0-plugins-base \
  gstreamer1.0-plugins-good \
  libwebpdemux2 \
  libavif16 \
  libharfbuzz-icu0 \
  libwebpmux3 \
  libenchant-2-2 \
  libsecret-1-0 \
  libhyphen0 \
  libwayland-server0 \
  libmanette-0.2-0 \
  libgbm1 \
  libdrm2 \
  libgles2 \
  libflite1 \
  # X11 and display utilities
  xvfb \
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
