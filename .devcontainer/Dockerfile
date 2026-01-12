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
  # Zsh and dependencies for Oh My Zsh / Powerlevel10k
  zsh \
  locales \
  fontconfig \
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
  libnspr4 \
  libnss3 \
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

# Generate locale for Powerlevel10k
RUN sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen && locale-gen

# Create non-root user with Zsh as default shell
RUN useradd -m -s /bin/zsh node \
  && usermod -aG sudo node \
  && echo "node ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/node \
  && chmod 0440 /etc/sudoers.d/node

# Switch to node user
USER node

# Install Oh My Zsh
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended

# Install Powerlevel10k theme
RUN git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k

# Install useful Oh My Zsh plugins
RUN git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/plugins/zsh-autosuggestions \
  && git clone https://github.com/zsh-users/zsh-syntax-highlighting ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting

# Configure Zsh with Powerlevel10k and plugins
RUN sed -i 's/ZSH_THEME="robbyrussell"/ZSH_THEME="powerlevel10k\/powerlevel10k"/' ~/.zshrc \
  && sed -i 's/plugins=(git)/plugins=(git zsh-autosuggestions zsh-syntax-highlighting docker node npm bun)/' ~/.zshrc

# Add Powerlevel10k instant prompt and basic configuration
RUN echo '# Enable Powerlevel10k instant prompt' >> ~/.zshrc \
  && echo 'if [[ -r "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh" ]]; then' >> ~/.zshrc \
  && echo '  source "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh"' >> ~/.zshrc \
  && echo 'fi' >> ~/.zshrc \
  && echo '' >> ~/.zshrc \
  && echo '# Source Powerlevel10k config if it exists' >> ~/.zshrc \
  && echo '[[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh' >> ~/.zshrc

# Create Claude Code auth directory (will be volume-mounted, but sets ownership template)
RUN mkdir -p /home/node/.claude && chmod 700 /home/node/.claude

# Install Bun (optional)
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/home/node/.bun/bin:${PATH}"
