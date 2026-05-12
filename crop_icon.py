from PIL import Image

for filename in ['assets/images/Logo promoink.png', 'assets/images/logo blanco (2).png']:
    try:
        img = Image.open(filename).convert('RGBA')
        bbox = img.getbbox()
        if bbox:
            min_x, min_y, max_x, max_y = bbox
            w = max_x - min_x
            h = max_y - min_y
            print(f"{filename}: width={w}, height={h}, aspect={w/h:.2f}")
            
            if w/h > 1.5:
                # crop square from left
                icon_img = img.crop((min_x, min_y, min_x+h, max_y))
            else:
                # crop top square
                icon_img = img.crop((min_x, min_y, max_x, min_y+w))
            
            # shrink it
            icon_img.thumbnail((256, 256), Image.Resampling.LANCZOS)
            icon_img.save('assets/images/favicon.png')
            print(f"Saved favicon.png from {filename}")
            break
    except Exception as e:
        print(f"Error processing {filename}: {e}")
