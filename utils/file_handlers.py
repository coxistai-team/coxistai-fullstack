"""File handling utilities for the chatbot."""

import logging
import os
import glob
from typing import Tuple, Optional
from datetime import datetime, timedelta
from modules.image_ocr import extract_text_from_image
from modules.pdf_parser import extract_text_from_file

logger = logging.getLogger(__name__)

def extract_text_from_file_input(file_path: str, file_type: str) -> Tuple[Optional[str], bool]:
    """Extract text from different file types using modules"""
    try:
        if file_type == 'image':
            text = extract_text_from_image(file_path)
            return text, True if text and text.strip() else False
        elif file_type == 'document':
            text, success = extract_text_from_file(file_path)
            return text, success
        else:
            return None, False
    except Exception as e:
        logger.error(f"Error extracting text from {file_type}: {str(e)}")
        return None, False

def cleanup_temp_files(temp_dir: str, max_age_hours: int = 1) -> None:
    """Clean up temporary files older than max_age_hours"""
    try:
        if not os.path.exists(temp_dir):
            return

        cutoff_time = datetime.now() - timedelta(hours=max_age_hours)
        
        # Get all files in temp directory
        for file_path in glob.glob(os.path.join(temp_dir, '*')):
            try:
                # Check file age
                mtime = datetime.fromtimestamp(os.path.getmtime(file_path))
                if mtime < cutoff_time:
                    os.remove(file_path)
                    logger.info(f"Cleaned up old temp file: {file_path}")
            except Exception as e:
                logger.error(f"Error cleaning up file {file_path}: {str(e)}")
                
    except Exception as e:
        logger.error(f"Error during temp file cleanup: {str(e)}")

def ensure_dir_exists(directory: str, mode: int = 0o755) -> None:
    """Ensure directory exists with proper permissions"""
    try:
        os.makedirs(directory, mode=mode, exist_ok=True)
    except Exception as e:
        logger.error(f"Error creating directory {directory}: {str(e)}")
        raise 