# ERPNext 15 Development Environment
FROM python:3.11-slim-bullseye

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive \
    NODE_VERSION=18

# Install system dependencies
RUN apt-get update && apt-get install -y \
    # Build essentials
    build-essential \
    git \
    wget \
    curl \
    cron \
    # MariaDB client
    default-libmysqlclient-dev \
    mariadb-client \
    # Redis client
    redis-tools \
    # Additional dependencies
    libffi-dev \
    libssl-dev \
    libjpeg-dev \
    zlib1g-dev \
    libpq-dev \
    libwebp-dev \
    liblcms2-dev \
    libtiff-dev \
    tcl8.6-dev \
    tk8.6-dev \
    # wkhtmltopdf dependencies
    xvfb \
    libfontconfig \
    fontconfig \
    # Node.js
    && curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - \
    && apt-get install -y nodejs \
    # Yarn
    && npm install -g yarn \
    # wkhtmltopdf (multi-arch)
    && ARCH=$(dpkg --print-architecture) \
    && if [ "$ARCH" = "amd64" ]; then \
        wget https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6.1-2/wkhtmltox_0.12.6.1-2.bullseye_amd64.deb && \
        apt-get install -y ./wkhtmltox_0.12.6.1-2.bullseye_amd64.deb && \
        rm wkhtmltox_0.12.6.1-2.bullseye_amd64.deb; \
    else \
        apt-get install -y wkhtmltopdf; \
    fi \
    # Cleanup
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create frappe user
RUN useradd -ms /bin/bash frappe

# Set working directory
WORKDIR /workspace

# Copy apps directory
COPY --chown=frappe:frappe apps /workspace/apps

# Install bench
RUN pip install --no-cache-dir frappe-bench

# Install Python dependencies for frappe
RUN cd /workspace/apps/frappe && pip install --no-cache-dir -e .

# Install Python dependencies for erpnext
RUN cd /workspace/apps/erpnext && pip install --no-cache-dir -e .

# Create sites directory and set permissions
RUN mkdir -p /workspace/sites && \
    chown -R frappe:frappe /workspace

# Switch to frappe user
USER frappe

# Expose port
EXPOSE 8000 9000

# Default command
CMD ["/bin/bash"]
