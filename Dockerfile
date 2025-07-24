# ---- Stage 1: Builder ----
# Use a full Python image to build dependencies, which may require build tools.
FROM python:3.12-slim-bookworm as builder

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install system-level dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-eng \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Create a non-root user and group
RUN groupadd -g 1001 appuser && \
    useradd -u 1001 -g appuser -m -s /bin/bash appuser

# Create and own the virtual environment
ENV VENV_PATH=/home/appuser/venv
RUN python3 -m venv $VENV_PATH && \
    chown -R appuser:appuser $VENV_PATH

# Activate the virtual environment
ENV PATH="$VENV_PATH/bin:$PATH"

WORKDIR /app

# --- FIX: Added a space before the final period ---
COPY --chown=appuser:appuser requirements.txt .

USER appuser

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt


# ---- Stage 2: Final Image ----
FROM python:3.12-slim-bookworm as final

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Create the same non-root user
RUN groupadd -g 1001 appuser && \
    useradd -u 1001 -g appuser -m -s /bin/bash appuser

# Copy the virtual environment from the builder stage
ENV VENV_PATH=/home/appuser/venv
COPY --from=builder --chown=appuser:appuser $VENV_PATH $VENV_PATH

# Copy the required system libraries from the builder stage
COPY --from=builder /usr/lib/ /usr/lib/
COPY --from=builder /usr/share/ /usr/share/

# Activate the virtual environment
ENV PATH="$VENV_PATH/bin:$PATH"

WORKDIR /app

USER appuser

# --- FIX: Corrected COPY commands for app.py and modules ---
COPY --chown=appuser:appuser app.py .
COPY --chown=appuser:appuser modules ./modules

# Expose the port that Render will use
EXPOSE 10000

# Set the command to run the application with Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:10000", "app:app"]
