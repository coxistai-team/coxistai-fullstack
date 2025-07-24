# Stage 1: Use the official Python 3.12 slim image based on Debian Bookworm
FROM python:3.12-slim-bookworm

# Set environment variables for a non-interactive and optimized build
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=off \
    PIP_DISABLE_PIP_VERSION_CHECK=on \
    PIP_DEFAULT_TIMEOUT=100

# Set the working directory inside the container
WORKDIR /app

# Install essential system-level dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    tesseract-ocr \
    poppler-utils \
    ffmpeg \
    && apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy only the requirements file first to leverage Docker's layer caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the application code into the container
COPY app.py .
COPY modules/ ./modules/

# Create a non-root user for security and switch to it
RUN useradd --create-home appuser
USER appuser

# Expose the port the app will run on (Render uses this)
EXPOSE 10000

# Use Gunicorn as a production-grade WSGI server
CMD ["gunicorn", "--bind", "0.0.0.0:10000", "--workers=4", "app:app"]