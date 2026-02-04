#!/usr/bin/env python3
"""
Simple script to generate a favicon with "K" letter using PIL
Run with: python3 generate-favicon.py
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    import os
except ImportError:
    print("⚠️  PIL (Pillow) not found.")
    print("\nTo generate the favicon automatically, install Pillow:")
    print("pip3 install Pillow")
    print("\nAlternatively:")
    print("1. Open create-favicon.html in your browser")
    print("2. Click 'Download favicon.ico'")
    print("3. Follow the instructions to convert PNG to ICO")
    exit(0)

# Create image
size = 32
img = Image.new('RGB', (size, size), color='#1890ff')
draw = ImageDraw.Draw(img)

# Try to use a good font, fallback to default
try:
    font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 24)
except:
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 24)
    except:
        font = ImageFont.load_default()

# Draw the letter K in white
text = "K"
# Get text size for centering
bbox = draw.textbbox((0, 0), text, font=font)
text_width = bbox[2] - bbox[0]
text_height = bbox[3] - bbox[1]

# Center the text
x = (size - text_width) // 2
y = (size - text_height) // 2 - 2  # Slight adjustment for visual centering

draw.text((x, y), text, fill='white', font=font)

# Save as PNG first
png_path = './src/favicon-32x32.png'
img.save(png_path, 'PNG')
print(f'✅ Favicon PNG generated: {png_path}')

# Try to save as ICO
try:
    ico_path = './src/favicon.ico'
    img.save(ico_path, format='ICO', sizes=[(32, 32)])
    print(f'✅ Favicon ICO generated: {ico_path}')
    print('\n🎉 Success! Favicon is ready to use.')
except Exception as e:
    print(f'\n⚠️  Could not generate .ico file: {e}')
    print('\nTo convert PNG to ICO:')
    print('1. Visit: https://favicon.io/favicon-converter/')
    print('2. Upload src/favicon-32x32.png')
    print('3. Download and replace src/favicon.ico')
