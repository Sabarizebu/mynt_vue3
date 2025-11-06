# Firebase Project Setup - mynt-v3

## ✅ Project Configuration

Your Firebase project has been successfully configured:

- **Project ID**: `mynt-v3`
- **Project Number**: `623075893111`
- **Status**: Active and ready for deployment

## 📁 Configuration Files

### `.firebaserc`
```json
{
  "projects": {
    "default": "mynt-v3"
  }
}
```

### `firebase.json`
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css|woff|woff2|ttf|eot|svg|png|jpg|jpeg|gif|ico)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.@(html|json)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache"
          }
        ]
      }
    ]
  }
}
```

## 🚀 Deployment Steps

### Step 1: Build the Application
```bash
npm run build
```

This will create an optimized production build in the `dist` folder.

### Step 2: Verify Firebase Project
```bash
firebase use
```

Should output: `mynt-v3`

### Step 3: Test Locally (Optional)
```bash
npm run firebase:serve
```

Visit `http://localhost:5000` to preview your app.

### Step 4: Deploy to Firebase
```bash
npm run deploy
```

Or use the individual commands:
```bash
npm run build
firebase deploy --only hosting
```

## 🌐 Your App URLs

After deployment, your app will be available at:
- **https://mynt-v3.web.app**
- **https://mynt-v3.firebaseapp.com**

## 🔧 Available Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Build for production |
| `npm run firebase:deploy` | Deploy to Firebase Hosting |
| `npm run deploy` | Build + Deploy (one command) |
| `npm run firebase:serve` | Test locally with Firebase |
| `firebase use mynt-v3` | Switch to mynt-v3 project |
| `firebase use` | Show current project |

## ✅ Verification Checklist

- [x] Firebase project `mynt-v3` exists
- [x] Project selected as default
- [x] `firebase.json` configured for hosting
- [x] `.firebaserc` configured with project ID
- [ ] Build successful (`npm run build`)
- [ ] Deployment successful (`npm run deploy`)

## 🛠️ Troubleshooting

### If deployment fails:

1. **Verify Firebase login:**
   ```bash
   firebase login
   ```

2. **Verify project access:**
   ```bash
   firebase projects:list
   ```
   Ensure `mynt-v3` is listed.

3. **Switch to project:**
   ```bash
   firebase use mynt-v3
   ```

4. **Check build output:**
   ```bash
   ls -la dist
   ```
   Ensure `dist` folder exists and contains files.

## 📚 Next Steps

1. **Build and Deploy:**
   ```bash
   npm run deploy
   ```

2. **Set Up Custom Domain (Optional):**
   - Go to Firebase Console → Hosting
   - Click "Add custom domain"
   - Follow DNS configuration instructions

3. **Monitor Deployment:**
   - Firebase Console → Hosting
   - View deployment history and analytics

## 🔗 Firebase Console

Access your Firebase project:
- **Console**: https://console.firebase.google.com/project/mynt-v3
- **Hosting**: https://console.firebase.google.com/project/mynt-v3/hosting

## 🎯 Quick Deploy

```bash
# One command to build and deploy
npm run deploy
```

Your app will be live in a few minutes!



