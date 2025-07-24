# Dockerfile

# --- Stage 1: Build Stage ---
# This stage installs all dependencies, including build tools,
# and pre-downloads the machine learning models.
FROM python:3.9-slim-buster AS builder

# Set environment variables for non-interactive build
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install critical system-level dependencies identified in the analysis.
# These are required by the Python packages but are not installed by pip.
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    poppler-utils \
    ffmpeg \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Create a non-root user for enhanced security
WORKDIR /app
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# --- Pre-download and cache ML models ---
# This crucial step "bakes" the models into the image, ensuring fast cold starts
# and preventing runtime downloads.
COPY modules/ modules/
RUN python -c "from modules.text_classifier import classifier; from modules.voice_input import model"


# --- Stage 2: Final Runtime Stage ---
# This stage creates a lean, secure image for production.
FROM python:3.9-slim-buster AS final

# Install only the necessary RUNTIME system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    poppler-utils \
    ffmpeg \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Create a non-root user and set permissions
RUN useradd --create-home appuser
WORKDIR /home/appuser/app
USER appuser

# Copy installed Python packages from the builder stage
COPY --from=builder /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages

# Copy the cached ML models from the builder stage
COPY --from=builder /root/.cache /home/appuser/.cache

# Copy the application code
COPY app.py.
COPY modules/ modules/

# Expose the port the application will run on
EXPOSE 5001

# Use Gunicorn as a production-ready WSGI server instead of the Flask dev server
# It is more robust, secure, and performant for handling concurrent requests.
CMD ["gunicorn", "--bind", "0.0.0.0:5001", "--workers", "2", "--threads", "4", "--timeout", "120", "app:app"]
