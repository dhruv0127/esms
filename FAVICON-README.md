# Kreddo Favicon

The Kreddo favicon features a bold white "K" on a blue (#1890ff) background.

## Current Setup

- **Primary Favicon**: `src/favicon-k.svg` (SVG format - works in modern browsers)
- **Fallback Favicon**: `src/favicon.ico` (ICO format - for older browsers)

## SVG Favicon

The SVG favicon is currently active and will display in modern browsers. It features:
- 100x100 viewBox for crisp rendering at any size
- Blue background (#1890ff) with rounded corners
- Bold white "K" letter

## Generate ICO Favicon (Optional)

If you want to update the .ico file for better compatibility with older browsers:

### Option 1: Use the HTML Generator (Easiest)

1. Open `create-favicon.html` in your browser
2. Click "Download favicon.ico"
3. Follow the instructions to convert PNG to ICO online
4. Replace `src/favicon.ico` with the new file

### Option 2: Use Python Script

```bash
# Install Pillow if not already installed
pip3 install Pillow

# Run the script
python3 generate-favicon.py
```

### Option 3: Online Tools

1. Go to https://favicon.io/favicon-generator/
2. Set these options:
   - Text: K
   - Background: #1890ff
   - Font: Arial Bold
   - Font Size: 70
   - Shape: Rounded
3. Download and replace `src/favicon.ico`

### Option 4: ImageMagick (Command Line)

If you have ImageMagick installed:

```bash
# First generate a PNG using the Python script, then:
convert src/favicon-32x32.png src/favicon.ico
```

## Browser Support

- **SVG Favicon**: Chrome, Firefox, Safari, Edge (modern versions)
- **ICO Favicon**: All browsers including older versions

The current setup includes both formats with SVG as primary and ICO as fallback.
