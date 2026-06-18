# Project Structure - HTML Basics Tools Suite

## Proposed Organization

```
htmlbasics/
├── 📁 config/                          # Configuration files
│   ├── .env                            # Environment variables
│   ├── .env.example                    # Example env file
│   ├── .gitignore                      # Git ignore rules
│   ├── ecosystem.config.cjs            # PM2 configuration
│   ├── package.json                    # Dependencies & scripts
│   ├── package-lock.json               # Locked dependencies
│   └── CNAME                           # Domain name
│
├── 📁 core/                            # Core shared files
│   ├── base-theme.js                   # Theme switching logic
│   ├── base-theme.css                  # Base theme styles
│   ├── app.js                          # Main application logic
│   └── styles.css                      # Global styles
│
├── 📁 public/                          # Public-facing pages
│   ├── index.html                      # Home/Dashboard page
│   ├── admin/                          # Admin section
│   │   └── [admin pages here]          # Admin-related pages
│   ├── register/                       # Registration section
│   │   └── [register pages here]       # Registration-related pages
│   └── uploads/                        # User uploads directory
│
├── 📁 modules/                         # Backend Node modules
│   └── node_modules/                   # npm dependencies
│
├── 📁 tools/                           # Independent utility tools
│   ├── 🔄 rfid-management/             # RFID Coupon & Management
│   │   ├── rfid-coupon.html            # RFID coupon generator
│   │   ├── rfid-sw.js                  # Service worker
│   │   └── rfid-icon.svg               # RFID icon asset
│   │
│   ├── 📊 excel-tools/                 # Excel manipulation tools
│   │   ├── excel-merger.html           # Merge/split Excel files
│   │   └── test-new-features.js        # Feature testing script
│   │
│   ├── 🎫 id-card/                     # ID Card Management
│   │   └── id-card-registration.html   # ID card registration form
│   │
│   ├── 📸 image-generator/             # Image URL tools
│   │   └── image-url-generator.html    # Generate image URLs
│   │
│   ├── 💬 messaging/                   # Communication tools
│   │   └── whatsapp.html               # WhatsApp integration
│   │
│   └── 📦 material-inward/             # Material management
│       └── material-inward-reg.html    # Material inward registration
│
├── 📁 assets/                          # Shared static assets
│   ├── icons/                          # Icon files
│   │   └── rfid-icon.svg               # (or move RFID-specific here)
│   ├── images/                         # Image assets
│   └── fonts/                          # Font files
│
├── 📄 README.md                        # Project documentation
├── 📄 DATABASE.sql                     # Database schema
└── 📄 server.js                        # Server entry point

```

## File Classification

### 🔄 RFID Management Module
- **Purpose**: RFID coupon generation and management
- **Files**:
  - `rfid-coupon.html` - Main RFID coupon interface
  - `rfid-sw.js` - Service worker for offline functionality
  - `rfid-icon.svg` - RFID icon asset

### 📊 Excel Tools Module
- **Purpose**: Excel file manipulation (merge, split, combine sheets)
- **Files**:
  - `excel-merger.html` - Main Excel merger interface
  - `test-new-features.js` - Test suite for new features

### 🎫 ID Card Management Module
- **Purpose**: ID card registration and generation
- **Files**:
  - `id-card-registration.html` - ID card registration form

### 📸 Image Generator Module
- **Purpose**: Generate and manage image URLs
- **Files**:
  - `image-url-generator.html` - Image URL generator interface

### 💬 Messaging Module
- **Purpose**: WhatsApp integration and messaging
- **Files**:
  - `whatsapp.html` - WhatsApp integration interface

### 📦 Material Inward Module
- **Purpose**: Track and manage material inward registration
- **Files**:
  - `material-inward-reg.html` - Material registration form

### 🔐 Core & Configuration
- **Purpose**: Shared utilities, styling, and configuration
- **Files**:
  - `index.html` - Home/Dashboard page
  - `app.js` - Main application logic
  - `styles.css` - Global styles
  - `base-theme.js` - Theme management
  - `base-theme.css` - Base theme styles
  - `.env` - Environment variables
  - `package.json` - Dependencies
  - `ecosystem.config.cjs` - PM2 configuration
  - `database.sql` - Database schema
  - `server.js` - Server entry point

## How to Reorganize

### Step 1: Create folder structure
Create these directories:
```
mkdir -p core public/admin public/register tools/{rfid-management,excel-tools,id-card,image-generator,messaging,material-inward} config assets/icons
```

### Step 2: Move files
**Core files** → `core/`:
- base-theme.js
- base-theme.css
- app.js
- styles.css

**RFID files** → `tools/rfid-management/`:
- rfid-coupon.html
- rfid-sw.js
- rfid-icon.svg

**Excel files** → `tools/excel-tools/`:
- excel-merger.html
- test-new-features.js

**ID Card files** → `tools/id-card/`:
- id-card-registration.html

**Image files** → `tools/image-generator/`:
- image-url-generator.html

**Messaging files** → `tools/messaging/`:
- whatsapp.html

**Material files** → `tools/material-inward/`:
- material-inward-reg.html

**Config files** → `config/`:
- .env
- .env.example
- package.json
- ecosystem.config.cjs
- database.sql
- CNAME

**Public files** → `public/`:
- index.html
- uploads/ (directory)

### Step 3: Update file references
After moving files, update these references:
- In `index.html`: Update all navigation links to point to new tool paths
- In `app.js`: Update import paths for moved modules
- In HTML files: Update stylesheet links (`<link rel="stylesheet" href="...">`)

### Navigation Links to Update
In `index.html`, change:
```html
<!-- OLD -->
<a href="rfid-coupon.html">Mess Management</a>
<a href="excel-merger.html">Excel Merger</a>

<!-- NEW -->
<a href="tools/rfid-management/rfid-coupon.html">Mess Management</a>
<a href="tools/excel-tools/excel-merger.html">Excel Merger</a>
```

## Module Dependencies

```
┌─────────────────────────────────────┐
│   index.html (Main Entry Point)     │
└─────────────────┬───────────────────┘
                  │
        ┌─────────┴─────────┬─────────────┬──────────────┐
        ▼                   ▼             ▼              ▼
   ┌─────────┐      ┌────────────┐  ┌──────────┐  ┌──────────┐
   │ base-   │      │ core/      │  │  tools/  │  │ public/  │
   │ theme   │      │ app.js     │  │ [modules]│  │ [pages]  │
   └─────────┘      └────────────┘  └──────────┘  └──────────┘
        │                  │
        └──────────────────┘
         (Shared assets)
```

## Benefits of This Organization

✅ **Clear module separation** - Each tool is independent  
✅ **Easy maintenance** - Find files quickly  
✅ **Scalable structure** - Easy to add new tools  
✅ **Better collaboration** - Team members understand relationships  
✅ **Reduced clutter** - Root directory stays clean  

