# CesiumJS Setup Guide

AI Detective uses CesiumJS for 3D globe visualization with satellite imagery, terrain, and buildings.

## Installation

After installing dependencies, you need to configure Cesium for Next.js:

```bash
npm install cesium resium
```

## Next.js Configuration

The `next.config.js` has been updated to handle Cesium assets. However, you may need to copy Cesium static files.

### Option 1: Copy Cesium Assets (Recommended)

Create a `public/cesium` directory and copy Cesium assets:

```bash
mkdir -p public/cesium
cp -r node_modules/cesium/Build/Cesium/* public/cesium/
```

### Option 2: Use CDN (Alternative)

You can configure Cesium to use a CDN by setting the `CESIUM_BASE_URL` environment variable:

```bash
CESIUM_BASE_URL=https://cesium.com/downloads/cesiumjs/releases/1.115/Build/Cesium/
```

## Environment Variables

Add to your `.env.local`:

```bash
# Cesium configuration (optional)
NEXT_PUBLIC_CESIUM_BASE_URL=/cesium

# Optional: Cesium Ion token for premium imagery (free tier available)
# Get your token at https://cesium.com/ion/
NEXT_PUBLIC_CESIUM_ION_TOKEN=your_token_here
```

Note: The CSS is automatically imported in `app/globals.css`. No additional CSS setup needed.

## Usage

The `GlobeViewer` component is automatically used when viewing case locations. It provides:

- Interactive 3D globe with satellite imagery
- Terrain and building visualization
- Location markers with color coding by type
- Click-to-view location details
- Smooth camera animations

## Troubleshooting

If the globe doesn't load:

1. Ensure Cesium assets are in `public/cesium/`
2. Check browser console for errors
3. Verify `next.config.js` webpack configuration
4. Try clearing `.next` cache: `rm -rf .next`

## Performance

Cesium is a large library. The component uses dynamic imports to avoid SSR issues and improve initial load time. The globe loads asynchronously on the client side.
