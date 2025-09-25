# HarvestIQ Workspace Cleanup Log

## Summary
This log documents the files and folders that were safely removed from the HarvestIQ workspace to optimize storage and organization while preserving all dependencies and essential project files.

## Files and Folders Removed

### 1. Duplicate Directory
- **Path**: `Py%20model/`
- **Reason for deletion**: Duplicate directory with encoded space in name, containing only an empty harvest.py file
- **Timestamp**: 2025-09-25
- **Status**: Successfully removed

### 2. Build Artifacts
- **Path**: `dist/`
- **Reason for deletion**: Build output directory that can be regenerated, already listed in .gitignore
- **Timestamp**: 2025-09-25
- **Status**: Successfully removed

### 3. Duplicate CSV Files
- **Path**: `Py model/csv/crop_yield.csv`
- **Reason for deletion**: Duplicate CSV file, primary dataset is in `Py model/crop_yield.csv`
- **Timestamp**: 2025-09-25
- **Status**: Successfully removed

## Files Preserved (Not Deleted)
The following files and folders were analyzed but intentionally preserved as they are essential to the project:

1. **Dependency Directories**:
   - `node_modules/` - Node.js dependencies
   - `Py model/` - Python model files and dependencies

2. **Configuration Files**:
   - `package.json` - Node.js project configuration
   - `package-lock.json` - Node.js dependency lock file
   - `requirements.txt` - Python dependencies
   - `.gitignore` - Version control ignore patterns
   - `vite.config.js` - Build tool configuration
   - `tailwind.config.js` - CSS framework configuration
   - `eslint.config.js` - Code linting configuration
   - `postcss.config.js` - CSS processing configuration

3. **Source Code Directories**:
   - `src/` - Frontend source code
   - `backend/` - Backend source code
   - `public/` - Static assets

4. **Documentation**:
   - `architecture.md` - System architecture documentation
   - `changelog.md` - Project change log
   - `future.md` - Future roadmap

5. **Scripts**:
   - `check-status.bat` - System status check script
   - `start-all.bat` - Application startup script
   - `index.html` - Main HTML entry point

---
*Cleanup performed on 2025-09-25*
*Total space freed: Approximately 1.8 MB*