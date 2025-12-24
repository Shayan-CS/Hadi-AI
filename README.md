# Islamic-Study-Tools

## Running the Website

### Quick Start (Windows)

**Option 1: Using Batch File**
```bash
.\run-website.bat
```

**Option 2: Using PowerShell**
```powershell
.\run-website.ps1
```

**Option 3: Manual Steps**
```bash
# Navigate to the frontend directory
cd "Islamic Study Tools Frontend"

# Install dependencies (first time only)
npm install

# Start the development server
npm run dev
```

The website will be available at `http://localhost:5173` (or the port shown in the terminal).

### Building for Production

```bash
cd "Islamic Study Tools Frontend"
npm run build
npm run preview
```

## Project Structure

- `Islamic Study Tools Frontend/` - React + Vite frontend application
- `backend/` - Backend directory (currently empty)
- `frontend/` - Frontend directory (currently empty)