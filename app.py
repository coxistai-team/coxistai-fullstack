import os
import logging
from typing import List, Dict, Any
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import multiprocessing

# Import only needed modules
from modules.image_ocr import extract_text_from_image
from modules.pdf_parser import extract_text_from_file
from modules.text_classifier import is_educational
from modules.query import assistant
from utils.prompts import improve_question_prompt
from utils.file_handlers import extract_text_from_file_input, cleanup_temp_files, ensure_dir_exists

# Configure logging with proper format
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

class Config:
    """Application configuration"""
    def __init__(self):
        load_dotenv()
        
        # API Keys and Security
        self.openai_key = os.getenv("OPENROUTER_API_KEY")
        if not self.openai_key:
            raise RuntimeError("OPENROUTER_API_KEY not set in environment variables.")
        
        # CORS Configuration
        self.allowed_origins = self._get_allowed_origins()
        
        # Server Configuration - Optimized for Render Hobby Plan (2GB RAM, 1 CPU)
        self.workers = 2  # 2 workers for 2GB RAM on Hobby plan
        self.timeout = 30
        self.max_content_length = 8 * 1024 * 1024  # 8MB limit for Hobby plan
        
        # Storage Configuration for Render Disk
        self.persistent_storage = "/opt/render/project/src/data"  # Render's default mount path
        self.temp_storage = "/tmp"  # Use system temp for temporary files
        self.upload_folder = os.path.join(self.temp_storage, 'temp_uploads')
        
        # Create directories with proper permissions
        for directory in [self.persistent_storage, self.upload_folder]:
            ensure_dir_exists(directory, mode=0o755)
        
        # Schedule periodic cleanup
        self._schedule_cleanup()
        
        # File configurations
        self.allowed_extensions = {
            'image': {'png', 'jpg', 'jpeg'},  # Reduced to common formats
            'document': {'pdf'},  # Limited to PDF only for memory efficiency
        }
        
        logger.info(f"Configured workers: {self.workers}")
        logger.info(f"Configured timeout: {self.timeout} seconds")
        logger.info(f"Configured CORS origins: {self.allowed_origins}")
        logger.info(f"Storage path: {self.persistent_storage}")

    def _schedule_cleanup(self) -> None:
        """Schedule periodic cleanup of temp files"""
        import threading
        import time

        def cleanup_worker():
            while True:
                try:
                    cleanup_temp_files(self.upload_folder)
                    time.sleep(3600)  # Run every hour
                except Exception as e:
                    logger.error(f"Error in cleanup worker: {str(e)}")
                    time.sleep(60)  # Wait a minute before retrying

        # Start cleanup thread
        cleanup_thread = threading.Thread(target=cleanup_worker, daemon=True)
        cleanup_thread.start()
        logger.info("Started temp file cleanup worker")

    def _get_allowed_origins(self) -> List[str]:
        """Get allowed origins from environment"""
        origins = os.getenv("ALLOWED_ORIGINS", "*")
        if origins == "*":
            return ["*"]
        return [origin.strip() for origin in origins.split(",") if origin.strip()]

    def _calculate_workers(self) -> int:
        """Calculate optimal number of workers for Hobby plan"""
        return 2  # Fixed at 2 workers for 2GB RAM

def create_app(config: Config) -> Flask:
    """Application factory pattern"""
    app = Flask(__name__)
    
    # Apply configuration
    app.config['MAX_CONTENT_LENGTH'] = config.max_content_length
    app.config['UPLOAD_FOLDER'] = config.upload_folder
    app.config['TIMEOUT'] = config.timeout
    
    # Configure CORS
    CORS(app, resources={
        r"/*": {
            "origins": config.allowed_origins,
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "max_age": 86400  # Cache preflight requests for 24 hours
        }
    })
    
    # CORS headers middleware
    @app.after_request
    def after_request(response):
        origin = request.headers.get('Origin')
        if origin and origin in config.allowed_origins:
            response.headers['Access-Control-Allow-Origin'] = origin
        elif '*' in config.allowed_origins:
            response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        return response

    def allowed_file(filename: str, file_type: str) -> bool:
        """Check if file extension is allowed"""
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in config.allowed_extensions.get(file_type, set())

    @app.route('/api/health')
    def health_check():
        """Health check endpoint"""
        return jsonify({
            'status': 'healthy',
            'supported_files': {k: list(v) for k, v in config.allowed_extensions.items()}
        })

    @app.route('/api/chat/text', methods=['POST'])
    def chat_text():
        """Process text input from frontend"""
        try:
            data = request.get_json()
            
            if not data or 'message' not in data:
                return jsonify({'error': 'Message is required'}), 400
            
            message = data['message'].strip()
            if not message:
                return jsonify({'error': 'Message cannot be empty'}), 400
            
            if not is_educational(message):
                return jsonify({
                    'success': True,
                    'ai_response': "I specialize in educational content. Please ask about academic subjects like math, science, history, or other learning topics.",
                    'is_educational': False,
                    'type': 'text_input'
                })
            
            enhanced_question = improve_question_prompt(message)
            
            try:
                # Set a timeout for the OpenAI API call
                from functools import partial
                import signal
                
                def timeout_handler(signum, frame):
                    raise TimeoutError("Request timed out")
                
                # Set the signal handler and a 25-second timeout
                signal.signal(signal.SIGALRM, timeout_handler)
                signal.alarm(25)
                
                try:
                    response = assistant.get_response(enhanced_question)
                    signal.alarm(0)  # Disable the alarm
                except TimeoutError:
                    return jsonify({
                        'success': False,
                        'error': 'Request timed out. Please try again.',
                        'type': 'timeout_error'
                    }), 504
                finally:
                    signal.alarm(0)  # Ensure the alarm is disabled
                
                return jsonify({
                    'success': True,
                    'ai_response': response,
                    'is_educational': True,
                    'type': 'text_input'
                })
            except Exception as ai_error:
                logger.error(f"AI response error: {str(ai_error)}")
                return jsonify({
                    'success': False,
                    'error': 'Failed to generate response. Please try again.',
                    'type': 'ai_error'
                }), 500
            
        except Exception as e:
            logger.error(f"Error in chat_text: {str(e)}")
            return jsonify({'error': 'Failed to process message'}), 500

    @app.route('/api/chat/file', methods=['POST'])
    def chat_file():
        """Process file upload from frontend"""
        try:
            if 'file' not in request.files:
                return jsonify({'error': 'No file provided'}), 400
                
            file = request.files['file']
            if file.filename == '':
                return jsonify({'error': 'No file selected'}), 400
            
            filename = secure_filename(file.filename)
            file_type = None
            
            # Check file type
            for ftype, extensions in config.allowed_extensions.items():
                if allowed_file(filename, ftype):
                    file_type = ftype
                    break
            
            if not file_type:
                return jsonify({
                    'error': f'Unsupported file type. Allowed types: {config.allowed_extensions}'
                }), 400
            
            # Check file size before saving
            file.seek(0, os.SEEK_END)
            size = file.tell()
            if size > config.max_content_length:
                return jsonify({
                    'error': f'File too large. Maximum size is {config.max_content_length / (1024 * 1024)}MB'
                }), 413
            file.seek(0)
            
            temp_path = os.path.join(config.upload_folder, filename)
            try:
                file.save(temp_path)
                
                # Process file
                extracted_text, success = extract_text_from_file_input(temp_path, file_type)
                
                if not success or not extracted_text:
                    return jsonify({
                        'success': False,
                        'error': f'Failed to extract text from {file_type} file.',
                        'type': 'extraction_error'
                    }), 400
                
                if not is_educational(extracted_text):
                    return jsonify({
                        'success': True,
                        'ai_response': "This content doesn't appear to be educational. I can help with textbooks, research papers, and other academic materials.",
                        'extracted_text': extracted_text[:500] + '...' if len(extracted_text) > 500 else extracted_text,
                        'is_educational': False,
                        'type': 'file_input'
                    })
                
                enhanced_question = improve_question_prompt(extracted_text)
                
                try:
                    # Set timeout for API call
                    from functools import partial
                    import signal
                    
                    def timeout_handler(signum, frame):
                        raise TimeoutError("Request timed out")
                    
                    signal.signal(signal.SIGALRM, timeout_handler)
                    signal.alarm(25)
                    
                    try:
                        response = assistant.get_response(enhanced_question)
                        signal.alarm(0)
                    except TimeoutError:
                        return jsonify({
                            'success': False,
                            'error': 'Request timed out. Please try again.',
                            'type': 'timeout_error'
                        }), 504
                    finally:
                        signal.alarm(0)
                    
                    return jsonify({
                        'success': True,
                        'ai_response': response,
                        'extracted_text': extracted_text[:1000] + '...' if len(extracted_text) > 1000 else extracted_text,
                        'is_educational': True,
                        'type': 'file_input'
                    })
                except Exception as ai_error:
                    logger.error(f"AI response error: {str(ai_error)}")
                    return jsonify({
                        'success': False,
                        'error': 'Failed to generate response.',
                        'type': 'ai_error'
                    }), 500
            finally:
                # Clean up temp file
                if os.path.exists(temp_path):
                    try:
                        os.remove(temp_path)
                    except Exception as e:
                        logger.error(f"Failed to remove temp file {temp_path}: {str(e)}")
                    
        except Exception as e:
            logger.error(f"Error processing file: {str(e)}")
            return jsonify({'error': 'Failed to process file'}), 500

    @app.errorhandler(413)
    def too_large(e):
        return jsonify({'error': 'File too large. Maximum size is 16MB.'}), 413

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': 'Endpoint not found'}), 404

    @app.errorhandler(500)
    def internal_error(e):
        logger.error(f"Internal server error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

    return app

# Create configuration
config = Config()

# Create application
app = create_app(config)

if __name__ == '__main__':
    # For local development
    app.run(debug=True, host='0.0.0.0', port=5001)
else:
    # For production with Gunicorn
    import gunicorn.app.base
    
    class StandaloneApplication(gunicorn.app.base.BaseApplication):
        def __init__(self, app, options=None):
            self.options = options or {}
            self.application = app
            super().__init__()
        
        def load_config(self):
            for key, value in self.options.items():
                self.cfg.set(key.lower(), value)
        
        def load(self):
            return self.application
    
    options = {
        'bind': '0.0.0.0:10000',
        'workers': config.workers,
        'timeout': config.timeout,
        'worker_class': 'sync',
        'worker_connections': 100,  # Reduced for Hobby plan
        'keepalive': 2,
        'max_requests': 500,  # Reduced for memory management
        'max_requests_jitter': 50,
        'preload_app': True,
        'accesslog': '-',  # Log to stdout
        'errorlog': '-',   # Log to stderr
        'loglevel': 'info',
        'capture_output': True,
        'enable_stdio_inheritance': True,
        # Worker configurations
        'worker_tmp_dir': '/dev/shm',  # Use RAM for temp files
        'post_worker_init': 'post_worker_init',  # Initialize worker
        'worker_exit': 'worker_exit',  # Cleanup on worker exit
    }
