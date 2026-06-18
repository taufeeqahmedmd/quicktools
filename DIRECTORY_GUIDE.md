# 📁 Project Directory Structure - Quick Reference

## Current Organization

```
htmlbasics/
│
├── 📄 index.html                    [MOVED TO public/]
├── 🔗 Direct Links
│   ├── Go to public/index.html to start
│
├── 📁 core/                         ✨ SHARED CORE FILES
│   ├── base-theme.js                (Theme switching logic)
│   ├── base-theme.css               (Base theme styling)
│   ├── app.js                       (Main app logic)
│   └── styles.css                   (Global styles)
│
├── 📁 public/                       🏠 PUBLIC ENTRY POINT
│   ├── index.html                   (Home/Dashboard page)
│   ├── admin/                       (Admin pages - [if any])
│   ├── register/                    (Register pages - [if any])
│   └── uploads/                     (User uploaded files)
│
├── 📁 tools/                        🛠️ MODULAR TOOLS
│   │
│   ├── 🔄 rfid-management/
│   │   ├── rfid-coupon.html         (RFID coupon generator)
│   │   ├── rfid-sw.js               (Service worker for offline)
│   │   └── rfid-icon.svg            (RFID icon asset)
│   │
│   ├── 📊 excel-tools/
│   │   ├── excel-merger.html        (Merge/split Excel sheets)
│   │   └── test-new-features.js     (Feature testing)
│   │
│   ├── 🎫 id-card/
│   │   └── id-card-registration.html (ID card registration)
│   │
│   ├── 📸 image-generator/
│   │   └── image-url-generator.html (Generate image URLs)
│   │
│   ├── 💬 messaging/
│   │   └── whatsapp.html            (WhatsApp integration)
│   │
│   └── 📦 material-inward/
│       └── [files here]             (Material registration)
│
├── 📁 assets/                       🎨 STATIC ASSETS
│   ├── icons/                       (Icon library)
│   └── images/                      (Image assets)
│
├── 📄 PROJECT_STRUCTURE.md          (Detailed organization guide)
├── 📄 DIRECTORY_GUIDE.md            (This file - Quick reference)
├── 📄 package.json                  (Dependencies)
├── 📄 database.sql                  (Database schema)
└── 📄 README.md                     (Project documentation)

```

---

## Module Details & Entry Points

### 🔄 RFID Management
**Purpose:** Generate and manage RFID coupons  
**Entry Point:** `tools/rfid-management/rfid-coupon.html`  
**Related Files:**
- `rfid-sw.js` - Service worker for offline support
- `rfid-icon.svg` - Icon asset

**Access from Home:** Dashboard → "Mess Management"

---

### 📊 Excel Tools
**Purpose:** Merge, split, and combine Excel sheets  
**Entry Point:** `tools/excel-tools/excel-merger.html`  
**Related Files:**
- `test-new-features.js` - Test suite

**Features:**
- ✅ Merge multiple files with header/position matching
- ✅ Merge multiple sheets from one file
- ✅ Split sheets by column values

**Access from Home:** Dashboard → "Excel Merger"

---

### 🎫 ID Card Management
**Purpose:** Register and generate ID cards  
**Entry Point:** `tools/id-card/id-card-registration.html`  
**Related Files:** None (standalone)

**Access from Home:** Dashboard → "ID Cards"

---

### 📸 Image URL Generator
**Purpose:** Generate and manage image URLs  
**Entry Point:** `tools/image-generator/image-url-generator.html`  
**Related Files:** None (standalone)

**Access from Home:** Dashboard → "Image URLs"

---

### 💬 Messaging
**Purpose:** WhatsApp integration and messaging  
**Entry Point:** `tools/messaging/whatsapp.html`  
**Related Files:** None (standalone)

**Access from Home:** Dashboard → "WhatsApp"

---

### 📦 Material Inward
**Purpose:** Track and manage material inward registration  
**Entry Point:** `tools/material-inward/[files]`  
**Related Files:** Backend integration needed

---

## File Reference Paths

### From Home Page (public/index.html)
```html
<!-- Stylesheets -->
<link rel="stylesheet" href="../core/base-theme.css">
<script src="../core/base-theme.js"></script>

<!-- Navigation Links -->
<a href="../tools/rfid-management/rfid-coupon.html">Mess Management</a>
<a href="../tools/id-card/id-card-registration.html">ID Cards</a>
<a href="../tools/image-generator/image-url-generator.html">Image URLs</a>
<a href="../tools/messaging/whatsapp.html">WhatsApp</a>
<a href="../tools/excel-tools/excel-merger.html">Excel Merger</a>
```

### From Tool Files (e.g., tools/excel-tools/excel-merger.html)
```html
<!-- Back to core files (one level up to parent, then into core) -->
<link rel="stylesheet" href="../../core/base-theme.css">
<script src="../../core/base-theme.js"></script>

<!-- Back to home -->
<a href="../../public/index.html">← Back to Home</a>
```

---

## Navigation Map

```
Home (public/index.html)
├── Certificates (index.html)
├── Mess Management → tools/rfid-management/rfid-coupon.html
├── ID Cards → tools/id-card/id-card-registration.html
├── Image URLs → tools/image-generator/image-url-generator.html
├── WhatsApp → tools/messaging/whatsapp.html
└── Excel Merger → tools/excel-tools/excel-merger.html
```

---

## How to Add a New Tool

1. **Create a new folder** in `tools/`:
   ```
   tools/my-new-tool/
   ```

2. **Create HTML file** with proper references:
   ```html
   <link rel="stylesheet" href="../../core/base-theme.css">
   <script src="../../core/base-theme.js"></script>
   ```

3. **Add navigation link** in `public/index.html`:
   ```html
   <a href="../tools/my-new-tool/index.html" class="app-nav-item">
     <span class="app-nav-icon">🆕</span>
     <span>My New Tool</span>
   </a>
   ```

4. **Done!** Your tool is now integrated

---

## Quick Stats

| Category | Count |
|----------|-------|
| Tools | 6 |
| Core Files | 4 |
| Total Modules | 10 |
| Configuration Files | 5 |

---

## File Migration Summary

✅ **Moved to core/** (Shared across all tools)
- base-theme.js
- base-theme.css
- app.js
- styles.css

✅ **Moved to tools/rfid-management/**
- rfid-coupon.html
- rfid-sw.js
- rfid-icon.svg

✅ **Moved to tools/excel-tools/**
- excel-merger.html
- test-new-features.js

✅ **Moved to tools/id-card/**
- id-card-registration.html

✅ **Moved to tools/image-generator/**
- image-url-generator.html

✅ **Moved to tools/messaging/**
- whatsapp.html

✅ **Moved to public/**
- index.html

---

## Next Steps

1. Update any remaining file references if needed
2. Test all navigation links work correctly
3. Verify all stylesheets load properly
4. Check that service workers (if any) still function
5. Test responsive design across all tools

