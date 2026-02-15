# Transloadit Setup Guide

## Assignment Requirement
Upload Image and Upload Video nodes **must** use Transloadit for file uploads.

## Steps to Configure

### 1. Sign up for Transloadit
1. Go to https://transloadit.com/signup/
2. Create a free account
3. Get your Auth Key from the dashboard

### 2. Create Templates

#### Image Upload Template
```json
{
  "steps": {
    "import": {
      "robot": "/upload/handle"
    },
    "optimize": {
      "use": "import",
      "robot": "/image/optimize",
      "progressive": true,
      "quality": 85
    },
    "store": {
      "use": "optimize",
      "robot": "/s3/store",
      "credentials": "YOUR_S3_CREDENTIALS",
      "path": "images/${unique_prefix}/${file.name}"
    }
  }
}
```

#### Video Upload Template
```json
{
  "steps": {
    "import": {
      "robot": "/upload/handle"
    },
    "encode": {
      "use": "import",
      "robot": "/video/encode",
      "preset": "ipad-high"
    },
    "store": {
      "use": "encode",
      "robot": "/s3/store",
      "credentials": "YOUR_S3_CREDENTIALS",
      "path": "videos/${unique_prefix}/${file.name}"
    }
  }
}
```

### 3. Add to .env
```bash
VITE_TRANSLOADIT_KEY=your_auth_key_here
VITE_TRANSLOADIT_TEMPLATE_IMAGE=your_image_template_id
VITE_TRANSLOADIT_TEMPLATE_VIDEO=your_video_template_id
```

### 4. Supported Formats

**Images:** jpg, jpeg, png, webp, gif  
**Videos:** mp4, mov, webm, m4v

## Testing
Once configured, the Upload Image and Upload Video nodes will:
1. Open Transloadit upload dialog
2. Upload files to Transloadit
3. Process via your template
4. Return the final URL
5. Display preview in the node
