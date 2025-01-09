FROM node:lts-bookworm-slim
# procps - for access to ps command like pkill and pgrep
RUN apt-get update && apt-get install -y \
    nano git curl \ 
    python3-pip udev build-essential \
    libssl-dev openssl  \
    procps \ 
    && rm -rf /var/lib/apt/lists/*

# Download and install Micromamba
# ENV MAMBA_ROOT_PREFIX=/opt/micromamba
# RUN curl -Ls https://micro.mamba.pm/api/micromamba/linux-64/latest | tar -xvj bin/micromamba && \
#     ./bin/micromamba shell init -s bash -r $MAMBA_ROOT_PREFIX
# RUN mkdir -p /opt/micromamba/envs && chmod 777 /opt/micromamba/envs
# Define the MAMBA_ROOT_PREFIX environment variable

ENV MAMBA_ROOT_PREFIX=/opt/micromamba
RUN set -eux; \
    apkArch="$(dpkg --print-architecture)"; \
    case "$apkArch" in \
        amd64) ARCH="linux-64" ;; \
        arm64) ARCH="linux-aarch64" ;; \
        *) echo "Unsupported architecture: $apkArch" && exit 1 ;; \
    esac; \
    curl -Ls "https://micro.mamba.pm/api/micromamba/${ARCH}/latest" | tar -xvj bin/micromamba; \
    ./bin/micromamba shell init -s bash -r "${MAMBA_ROOT_PREFIX}"
RUN mkdir -p /opt/micromamba/envs && chmod 777 /opt/micromamba/envs


# Create a non-root user
RUN useradd -ms /bin/bash openiapuser
RUN mkdir -p /home/openiapuser/.mamba && \
    chown -R openiapuser:openiapuser /home/openiapuser/.mamba

USER openiapuser
WORKDIR /home/openiapuser

# Initialize Micromamba for the user
RUN echo 'eval "$(micromamba shell hook --shell=bash)"' >> ~/.bashrc

# Copy files with appropriate permissions
COPY --chown=openiapuser package.json package-lock.json ./

# Openshift hack
RUN chmod -R 777 /home/openiapuser
# Install NPM packages
RUN npm install --omit=dev --production --verbose
RUN rm -r /home/openiapuser/.npm/*

# Copy the rest of your application
COPY --chown=openiapuser . .
ENV HOME='/home/openiapuser'
ENV USER='openiapuser'

CMD ["node", "--require", "./dist/Logger.js", "dist/runagent.js"]
