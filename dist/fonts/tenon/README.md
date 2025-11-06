# Tenon Font Files

This directory is prepared for the Tenon font family files.

## Required Files

To complete the Tenon font implementation, add the following font files to this directory:

### Regular Weight (400)

- `tenon-regular.woff2`
- `tenon-regular.woff`
- `tenon-regular.ttf`

### Medium Weight (500)

- `tenon-medium.woff2`
- `tenon-medium.woff`
- `tenon-medium.ttf`

### Semi-Bold Weight (600)

- `tenon-semibold.woff2`
- `tenon-semibold.woff`
- `tenon-semibold.ttf`

### Bold Weight (700)

- `tenon-bold.woff2`
- `tenon-bold.woff`
- `tenon-bold.ttf`

## Current Status

The application is currently configured to use:

1. **Tenon** (primary - will work when font files are added)
2. **Inter** (fallback - currently loaded from Google Fonts)
3. System fonts (final fallback)

## Font Implementation

The font is already implemented in the following files:

- `/src/assets/style.css` - Main font declarations and @font-face rules
- `/src/assets/theme-light.css` - Light theme font family
- `/src/assets/theme-dark.css` - Dark theme font family
- `/public/theme-light.css` - Public light theme
- `/public/theme-dark.css` - Public dark theme
- `/index.html` - Inter font import as fallback

Once you add the Tenon font files to this directory, the application will automatically use them.
