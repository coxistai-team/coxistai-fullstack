#!/usr/bin/env python3
import os
import argparse

# --- Configuration for Python (Flask) + Node.js (Express/React) Fullstack Projects ---

# Directories to always exclude from the export
EXCLUDED_DIRS = {
    "__pycache__",
    ".git",
    ".vscode",
    ".idea",
    "venv",
    ".venv",
    "env",
    "node_modules",
    "dist",
    "build",
    "static",
    "media",
    "migrations",
}

# Sub-paths to exclude. Any file within these paths will be skipped.
# Use forward slashes, e.g., "src/components/ui"
EXCLUDED_SUBPATHS = {
    "src/components/ui",
    "components/ui", # To catch it if it's at the root
}


# File extensions to include in the export
INCLUDED_EXTENSIONS = {
    # Python
    ".py",
    # Frontend (React/JS/TS)
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    # Styling
    ".css",
    ".scss",
    # Markup & Data
    ".html",
    ".json",
    ".md",
    # Config & Scripts
    ".sql",
    ".sh",
    ".toml",
    ".ini",
}

# Specific filenames to ALWAYS INCLUDE (if found)
SPECIFIC_FILENAMES_TO_INCLUDE = {
    # Python
    "requirements.txt",
    "pyproject.toml",
    "Procfile",
    # Node.js
    "package.json",
    # Config
    "Dockerfile",
    "docker-compose.yml",
    ".gitignore",
    ".env.example", # Specifically include this
    "vite.config.js",
    "vite.config.ts",
    "tailwind.config.js",
    "tailwind.config.ts",
}

# Specific filenames to ALWAYS EXCLUDE
SPECIFIC_FILENAMES_TO_EXCLUDE = {
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "db.sqlite3",
    ".DS_Store",
}

# Patterns for filenames to exclude.
FILENAME_PATTERNS_TO_EXCLUDE = [
    # Excludes .env, .env.local, etc., but NOT .env.example
    lambda name: name.startswith(".env") and name != ".env.example"
]


def should_include_file(file_path):
    """Determines if a file should be included based on the configuration."""
    file_name = os.path.basename(file_path)

    if file_name in SPECIFIC_FILENAMES_TO_EXCLUDE:
        return False

    for pattern_checker in FILENAME_PATTERNS_TO_EXCLUDE:
        if pattern_checker(file_name):
            return False

    if file_name in SPECIFIC_FILENAMES_TO_INCLUDE:
        return True

    _, ext = os.path.splitext(file_name)
    if ext.lower() in INCLUDED_EXTENSIONS:
        return True

    return False


def process_directory(root_dir, output_file, additional_excludes=None):
    """Walks through the directory, processes files, and writes to the output file."""
    current_excluded_dirs = EXCLUDED_DIRS.copy()
    if additional_excludes:
        current_excluded_dirs.update(additional_excludes)

    all_content_parts = []
    
    print(f"🚀 Starting export from root directory: {os.path.abspath(root_dir)}")
    print(f"Ignoring directories: {sorted(list(current_excluded_dirs))}")
    print(f"Ignoring sub-paths: {sorted(list(EXCLUDED_SUBPATHS))}")

    for dirpath, dirnames, filenames in os.walk(root_dir, topdown=True):
        # Prevent descending into excluded directories
        dirnames[:] = [d for d in dirnames if d not in current_excluded_dirs]
        
        # Exclude files within specified sub-paths
        normalized_dirpath = os.path.relpath(dirpath, root_dir).replace("\\", "/")
        if normalized_dirpath != '.':
            if any(normalized_dirpath.startswith(p) for p in EXCLUDED_SUBPATHS):
                # By clearing dirnames and filenames, we effectively skip this whole tree
                dirnames[:] = [] 
                filenames[:] = []
                continue

        for filename in filenames:
            file_path = os.path.join(dirpath, filename)

            if should_include_file(file_path):
                relative_path = os.path.relpath(file_path, root_dir).replace("\\", "/")
                print(f"  -> Adding: {relative_path}")
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                    
                    file_entry = f"### {relative_path}:\n```\n{content}\n```\n\n"
                    all_content_parts.append(file_entry)
                except Exception as e:
                    print(f"  [!] Could not read file: {relative_path} due to {e}")

    if not all_content_parts:
        print("No files found to export based on the current configuration.")
        return

    print(f"\n✅ Found {len(all_content_parts)} files. Writing to {os.path.abspath(output_file)}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("".join(all_content_parts))
    print("Export complete!")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Consolidate all relevant source code files from a project into a single text file.",
        formatter_class=argparse.RawTextHelpFormatter
    )
    parser.add_argument(
        "root_dir",
        help="The root directory of the project to export (e.g., '.' for the current directory)."
    )
    parser.add_argument(
        "-o", "--output",
        default="consolidated_code.txt",
        help="The name of the output file (default: consolidated_code.txt)."
    )
    parser.add_argument(
        "--exclude-dirs",
        nargs='*',
        default=[],
        help="Additional directory names to exclude (e.g., 'assets' 'data')."
    )

    args = parser.parse_args()

    root_directory = os.path.abspath(args.root_dir)
    output_filename = os.path.abspath(args.output)
    
    process_directory(root_directory, output_filename, additional_excludes=set(args.exclude_dirs))