# Expo App Icons and Splash

This directory should contain the following assets for your Expo app:

## Required Assets:

### icon.png
- Size: 1024x1024 pixels
- Format: PNG with transparency
- Usage: App icon on home screen

### adaptive-icon.png  
- Size: 1024x1024 pixels
- Format: PNG with transparency
- Usage: Android adaptive icon foreground

### splash.png
- Size: 1284x2778 pixels (iPhone 13 Pro Max)
- Format: PNG
- Usage: Splash screen image

### favicon.png
- Size: 48x48 pixels
- Format: PNG
- Usage: Web favicon

## How to Generate:

1. **Use Expo's icon generator:**
   ```bash
   npx expo install expo-splash-screen
   ```

2. **Or create manually:**
   - Design a 1024x1024 icon
   - Use tools like Figma, Canva, or Photoshop
   - Export as PNG with transparent background

3. **For splash screen:**
   - Create a simple design with your logo
   - Use the brand colors (#667eea gradient)
   - Keep it minimal and fast-loading

## Brand Colors:
- Primary: #667eea
- Secondary: #764ba2
- Background: #f7fafc

## Logo Elements:
- 📶 Signal icon emoji
- "eSIM Pro" text
- Clean, modern design

---
**Note:** Place the actual image files in this directory to replace this README.
