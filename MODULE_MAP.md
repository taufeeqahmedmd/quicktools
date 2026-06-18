# 🗺️ Module Map & Relationships

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       APPLICATION ENTRY                         │
│                   public/index.html (HOME)                      │
│                  Dashboard & Navigation Hub                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                   ┌─────────┴─────────┐
                   ▼                   ▼
            ┌──────────────┐    ┌─────────────────────┐
            │ CORE FILES   │    │  TOOL MODULES       │
            │ (Shared)     │    │  (Independent)      │
            └──────────────┘    └─────────────────────┘
                   │                    │
        ┌──────────┼──────────┐        │
        ▼          ▼          ▼        │
    base-    base-     app.js   └──────┬───────────────────┐
    theme.   theme.    styles.         │                   │
     js       css       css            │                   │
        │      │        │              │                   │
        └──────┴────────┘              │                   │
             │                         │                   │
        USED BY ALL TOOLS          ┌───┴────┬─────────┬────┴──────┬──────────┐
        (via links)                 ▼        ▼         ▼           ▼          ▼
                            ┌─────────────┬─────────────────┬──────────┬────────────┐
                            │   RFID      │    EXCEL        │   ID     │  IMAGE     │
                            │ Management  │     Tools       │   Card   │ Generator  │
                            └─────────────┴─────────────────┴──────────┴────────────┘
                                  │              │              │           │
                            ┌─────┴─────┐  ┌────┴────┐    ┌────┘      ┌────┘
                            ▼           ▼  ▼         ▼    ▼           ▼
                        rfid-      rfid-  excel-   test- id-card  image-url-
                        coupon.     sw.js  merger.  new-  regist.  generator.
                        html              html     feat.  html     html
                                                   js
```

---

## Detailed Module Dependencies

### 🏠 HOME PAGE
```
public/index.html
├── Loads from:
│   ├── ../core/base-theme.css (Styling)
│   └── ../core/base-theme.js (Theme logic)
│
└── Links to:
    ├── ../tools/rfid-management/rfid-coupon.html
    ├── ../tools/id-card/id-card-registration.html
    ├── ../tools/image-generator/image-url-generator.html
    ├── ../tools/messaging/whatsapp.html
    └── ../tools/excel-tools/excel-merger.html
```

### 🔄 RFID MANAGEMENT
```
tools/rfid-management/
├── rfid-coupon.html (Entry Point)
│   ├── Loads: ../../core/base-theme.css
│   ├── Loads: ../../core/base-theme.js
│   └── Uses: ./rfid-icon.svg
│
├── rfid-sw.js (Service Worker)
│   └── Provides: Offline functionality
│
└── rfid-icon.svg (Asset)
    └── Used by: rfid-coupon.html
```

### 📊 EXCEL TOOLS
```
tools/excel-tools/
├── excel-merger.html (Entry Point)
│   ├── Loads: ../../core/base-theme.css
│   ├── Loads: ../../core/base-theme.js
│   └── External: SheetJS (XLSX) from CDN
│
└── test-new-features.js (Testing)
    └── Tests: Features in excel-merger.html
```

### 🎫 ID CARD MANAGEMENT
```
tools/id-card/
└── id-card-registration.html (Entry Point)
    ├── Loads: ../../core/base-theme.css
    └── Loads: ../../core/base-theme.js
```

### 📸 IMAGE GENERATOR
```
tools/image-generator/
└── image-url-generator.html (Entry Point)
    ├── Loads: ../../core/base-theme.css
    └── Loads: ../../core/base-theme.js
```

### 💬 MESSAGING
```
tools/messaging/
└── whatsapp.html (Entry Point)
    ├── Loads: ../../core/base-theme.css
    └── Loads: ../../core/base-theme.js
```

### 📦 MATERIAL INWARD
```
tools/material-inward/
└── [Backend integration required]
    ├── Potential frontend: material-inward-reg.html
    ├── Loads: ../../core/base-theme.css
    └── Loads: ../../core/base-theme.js
```

---

## File Access Patterns

### Pattern 1: From Home Page (public/index.html)
```
├── Access Core Files:
│   └── ../core/[filename]
│
└── Access Tool Files:
    └── ../tools/[module]/[filename]
```

**Example:**
```html
<link rel="stylesheet" href="../core/base-theme.css">
<a href="../tools/excel-tools/excel-merger.html">Excel Merger</a>
```

### Pattern 2: From Tool Files (tools/*/filename.html)
```
├── Access Core Files:
│   └── ../../core/[filename]
│
└── Access Other Parts:
    └── ../../public/index.html
```

**Example:**
```html
<link rel="stylesheet" href="../../core/base-theme.css">
<a href="../../public/index.html">← Back Home</a>
```

---

## Data Flow

```
USER
  │
  ├─→ Visits public/index.html
  │   │
  │   ├─→ Loads core styling (base-theme.css)
  │   ├─→ Loads core logic (base-theme.js)
  │   └─→ Shows navigation menu
  │
  └─→ Clicks module link
      │
      └─→ Navigates to tools/[module]/[file].html
          │
          ├─→ Loads core styling (from relative path)
          ├─→ Loads core logic (from relative path)
          └─→ Module executes independently
```

---

## Dependency Tree

```
CORE DEPENDENCIES
├── base-theme.css
│   └── Used by: HOME + ALL TOOLS
│
├── base-theme.js
│   └── Used by: HOME + ALL TOOLS
│
├── app.js
│   └── Used by: [To be implemented]
│
└── styles.css
    └── Used by: [To be implemented]

MODULE DEPENDENCIES
├── RFID
│   ├── rfid-coupon.html (depends on core)
│   ├── rfid-sw.js (standalone)
│   └── rfid-icon.svg (asset)
│
├── EXCEL TOOLS
│   ├── excel-merger.html (depends on core + SheetJS CDN)
│   └── test-new-features.js (testing)
│
├── ID CARD (depends on core)
├── IMAGE GENERATOR (depends on core)
├── MESSAGING (depends on core)
└── MATERIAL INWARD (depends on core + backend)
```

---

## Navigation Flow Chart

```
START
  │
  └─→ Load public/index.html
      │
      ├─→ YES: User clicks "Mess Management"
      │   └─→ Navigate to: ../tools/rfid-management/rfid-coupon.html
      │       └─→ [RFID Module Active]
      │
      ├─→ YES: User clicks "Excel Merger"
      │   └─→ Navigate to: ../tools/excel-tools/excel-merger.html
      │       └─→ [EXCEL Tools Module Active]
      │
      ├─→ YES: User clicks "ID Cards"
      │   └─→ Navigate to: ../tools/id-card/id-card-registration.html
      │       └─→ [ID Card Module Active]
      │
      ├─→ YES: User clicks "Image URLs"
      │   └─→ Navigate to: ../tools/image-generator/image-url-generator.html
      │       └─→ [Image Generator Module Active]
      │
      ├─→ YES: User clicks "WhatsApp"
      │   └─→ Navigate to: ../tools/messaging/whatsapp.html
      │       └─→ [Messaging Module Active]
      │
      └─→ YES: User clicks "Home"
          └─→ Back to: public/index.html
```

---

## Adding a New Module

### Step 1: Create Structure
```
tools/
└── my-new-tool/
    ├── index.html (or [name].html)
    ├── [supporting files]
    └── [assets]
```

### Step 2: Link Resources
```html
<!-- In tools/my-new-tool/index.html -->
<link rel="stylesheet" href="../../core/base-theme.css">
<script src="../../core/base-theme.js"></script>
```

### Step 3: Register in Home
```html
<!-- In public/index.html -->
<a href="../tools/my-new-tool/index.html" class="app-nav-item">
  <span class="app-nav-icon">🆕</span>
  <span>My New Tool</span>
</a>
```

### Step 4: That's it! 🎉

---

## Module Isolation Benefits

Each module is **completely independent**:

✅ Can be modified without affecting others  
✅ Can be disabled by removing nav link  
✅ Can be moved to separate repo if needed  
✅ Can have its own test suite  
✅ Can have different developers  
✅ Can be replaced/updated independently  

---

## Shared Resources

All modules share these from `/core`:

| File | Purpose | Used By |
|------|---------|---------|
| base-theme.css | Styling foundation | All modules |
| base-theme.js | Theme switching | All modules |
| app.js | Shared logic | [Configured] |
| styles.css | Global styles | [Configured] |

---

## Performance Considerations

```
Initial Load: public/index.html
  ├── Load: base-theme.css (Cached across all tools)
  └── Load: base-theme.js (Cached across all tools)

Module Load: Any tool
  ├── Reuse: base-theme.css (From cache)
  ├── Reuse: base-theme.js (From cache)
  └── Load: Module-specific resources (If any)
```

**Result:** Minimal redundancy, maximum caching benefits

---

## Troubleshooting Guide

### Issue: "File not found" errors

**Check:**
1. Are you using correct relative paths?
2. From `public/`: Use `../core/`
3. From `tools/module/`: Use `../../core/`

### Issue: Styles not applying

**Check:**
1. Is base-theme.css loading? (Check DevTools)
2. Are link tags pointing to correct path?
3. Check file exists at specified location

### Issue: Navigation broken

**Check:**
1. Do navigation links use correct relative paths?
2. Does target file exist at specified path?
3. Check for typos in filenames

---

## Summary

```
ORGANIZATION: Modular & Scalable
DEPENDENCIES: Minimal & Shared
NAVIGATION: Clear & Intuitive
MAINTENANCE: Easy & Independent
EXPANSION: Simple & Non-Breaking
```

Your project is now **optimized for growth and collaboration**! 🚀
