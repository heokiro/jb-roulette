# JetBrains Roulette

Roulette Game Application

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Firebase Hosting Deployment

### Manual Deployment

```bash
npm run deploy
```

### Automatic Deployment Setup (GitHub Actions)

This project is configured for automatic deployment via GitHub Actions. Pushing to the `main` or `master` branch will automatically deploy to Firebase Hosting.

#### Setup Instructions

1. **Generate Firebase Token**
   - Run the following command in your local terminal:
     ```bash
     firebase login:ci
     ```
   - When the browser opens, log in with your Google account and grant permissions
   - Copy the token displayed in the terminal

2. **Configure GitHub Secrets**
   - Go to your GitHub repository
   - Settings > Secrets and variables > Actions
   - Click "New repository secret"
   - Name: `FIREBASE_TOKEN`
   - Secret: Paste the token you generated earlier
   - Click "Add secret"

3. **Verify Automatic Deployment**
   - Push code to the `main` or `master` branch to trigger automatic deployment
   - Check the Actions tab to monitor deployment progress

## Tech Stack

- React
- Vite
- Styled Components
- Firebase Hosting
