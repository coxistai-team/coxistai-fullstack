# ---- Stage 1: Builder ----
# Use a full Python image to build dependencies, which may require build tools.
FROM python:3.12-slim-bookworm as builder

# Set environment variables to prevent Python from writing.pyc files and to buffer output.
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install system-level dependencies required for the application (e.g., Tesseract OCR).
# Using --no-install-recommends keeps the image size smaller.
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-eng \
    libtesseract5 \
    poppler-utils \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Create a non-root user and group that will run the application.
# Using a fixed UID/GID is a good practice for consistent permissions.
RUN groupadd -g 1001 appuser && \
    useradd -u 1001 -g appuser -m -s /bin/bash appuser

# Create a virtual environment owned by the non-root user.
# This isolates dependencies and avoids polluting the system Python installation.
ENV VENV_PATH=/home/appuser/venv
RUN python3 -m venv $VENV_PATH && \
    chown -R appuser:appuser $VENV_PATH

# Activate the virtual environment for subsequent commands.
ENV PATH="$VENV_PATH/bin:$PATH"

# Set the working directory.
WORKDIR /app

# Copy the dependency file and change its ownership to the non-root user.
COPY --chown=appuser:appuser requirements.txt.

# Switch to the non-root user BEFORE installing dependencies.
USER appuser

# Install Python dependencies into the virtual environment as the non-root user.
RUN pip install --no-cache-dir -r requirements.txt


# ---- Stage 2: Final Image ----
# Use a slim base image for the final application to reduce size and attack surface.
FROM python:3.12-slim-bookworm as final

# Set environment variables.
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Create the same non-root user as in the builder stage.
RUN groupadd -g 1001 appuser && \
    useradd -u 1001 -g appuser -m -s /bin/bash appuser

# Copy the virtual environment from the builder stage with correct ownership.
ENV VENV_PATH=/home/appuser/venv
COPY --from=builder --chown=appuser:appuser $VENV_PATH $VENV_PATH

# Copy the required system libraries from the builder stage.
COPY --from=builder /usr/lib/ /usr/lib/
COPY --from=builder /usr/share/ /usr/share/

# Activate the virtual environment.
ENV PATH="$VENV_PATH/bin:$PATH"

# Set the working directory.
WORKDIR /app

# Switch to the non-root user.
USER appuser

# Copy the application source code from the host machine with correct ownership.
# This is done in the final stage to leverage Docker's layer caching.
COPY --chown=appuser:appuser app.py.
COPY --chown=appuser:appuser modules/./modules/

# Expose the port that Render will use. This is for documentation; Render handles the actual port mapping.
EXPOSE 10000

# Set the default command to run the application.
# This will be overridden by the Start Command in the Render UI, but provides a sensible default.
CMD ["gunicorn", "--bind", "0.0.0.0:10000", "app:app"]
