<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1TYfBSZqZNZEp7NNzD4BKMmXJFM6kVjUN

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Vercel Deployment

This project is optimized for deployment on Vercel.

### 1. Deployment Steps
- Connect your repository to Vercel.
- Vercel will automatically detect the configuration.
- The Rewrites in `vercel.json` will handle routing.

### 2. Environment Variables
You MUST add the following environment variable in the Vercel Project Settings (Settings -> Environment Variables):
- `GEMINI_API_KEY`: Your Google Gemini API Key.
