FROM node:lts-bookworm-slim
RUN apt-get update && apt-get install -y \
    nano git curl \ 
    udev build-essential \
    libssl-dev openssl  \
    && rm -rf /var/lib/apt/lists/*

# Download and install Micromamba
ENV MAMBA_ROOT_PREFIX=/opt/micromamba
RUN curl -Ls https://micro.mamba.pm/api/micromamba/linux-64/latest | tar -xvj bin/micromamba && \
    ./bin/micromamba shell init -s bash -p $MAMBA_ROOT_PREFIX
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

# Install NPM packages
RUN npm install
# Openshift hack
RUN chmod -R 777 /home/openiapuser
RUN rm -r /home/openiapuser/.npm/*

# Copy the rest of your application
COPY --chown=openiapuser . .
ENV HOME='/home/openiapuser'
ENV USER='openiapuser'

CMD ["node", "--require", "./dist/Logger.js", "dist/runagent.js"]
