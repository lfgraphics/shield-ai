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

## Netlify Deployment

This project is optimized for deployment on Netlify using Netlify Functions.

### 1. Deployment Steps
- Connect your repository to Netlify.
- Netlify will automatically detect the `netlify.toml` settings.
- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `functions`

### 2. Environment Variables
You MUST add the following environment variable in the Netlify UI (Site settings -> Build & deploy -> Environment):
- `GEMINI_API_KEY`: Your Google Gemini API Key.

### 3. Local Development (with Netlify simulation)
```bash
npx netlify dev
```
