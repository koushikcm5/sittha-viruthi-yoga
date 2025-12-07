# App Icon Setup Instructions

## Required Icon Files

Place the following icon files in the `assets` folder:

### 1. **icon.png** (Required)
- Size: 1024x1024 pixels
- Format: PNG with transparency
- Used for: iOS and Android app icon

### 2. **adaptive-icon.png** (Android)
- Size: 1024x1024 pixels
- Format: PNG with transparency
- Used for: Android adaptive icon foreground
- Note: Keep important content in the center 66% of the image

### 3. **splash.png** (Optional)
- Size: 1284x2778 pixels (or similar aspect ratio)
- Format: PNG
- Used for: App splash screen
- Background color is set to #1B3B6F in app.json

## Quick Setup

1. Create or obtain your app logo/icon
2. Resize to 1024x1024 pixels
3. Save as `icon.png` in this folder
4. Copy and rename to `adaptive-icon.png` for Android
5. Create splash screen image and save as `splash.png`

## Using Online Tools

You can use these free tools to generate icons:
- https://www.appicon.co/
- https://icon.kitchen/
- https://makeappicon.com/

## Testing

After adding icons, run:
```bash
npx expo start --clear
```

## Current Configuration

The app.json is configured with:
- App name: "Sitthaviruthi Yoga"
- Primary color: #1B3B6F (dark blue)
- Adaptive icon background: #1B3B6F
