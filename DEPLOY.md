# Quick Deploy Guide - Firebase Hosting

## 🚀 Quick Start

### Step 1: Login to Firebase
```bash
firebase login
```

### Step 2: Verify Project
```bash
firebase use app-mynt
```

### Step 3: Build and Deploy
```bash
npm run deploy
```

That's it! Your app will be live at:
- **https://app-mynt.web.app**
- **https://app-mynt.firebaseapp.com**

## 📋 Detailed Steps

### 1. Build the Application
```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

### 2. Test Locally (Optional)
```bash
npm run firebase:serve
```
Visit `http://localhost:5000` to preview.

### 3. Deploy to Firebase
```bash
npm run firebase:deploy
```

Or use the combined command:
```bash
npm run deploy
```

## 🔧 Available Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Build for production |
| `npm run firebase:deploy` | Deploy to Firebase Hosting |
| `npm run deploy` | Build + Deploy (one command) |
| `npm run firebase:serve` | Test locally with Firebase |
| `npm run preview` | Test locally with Vite |

## ✅ Pre-Deployment Checklist

- [ ] Firebase CLI installed (`firebase --version`)
- [ ] Logged in to Firebase (`firebase login`)
- [ ] Project set to `app-mynt` (`firebase use app-mynt`)
- [ ] Dependencies installed (`npm install`)
- [ ] Build successful (`npm run build`)
- [ ] No console errors in preview

## 🌐 Post-Deployment

After deployment:
1. Visit your app at the URLs above
2. Check Firebase Console for deployment status
3. Monitor Firebase Analytics for traffic
4. Set up custom domain (optional)

## 🛠️ Troubleshooting

**Build fails?**
```bash
rm -rf node_modules dist
npm install
npm run build
```

**Deployment fails?**
```bash
firebase logout
firebase login
firebase use app-mynt
npm run deploy
```

**Need to rollback?**
1. Go to Firebase Console → Hosting
2. Select previous deployment
3. Click "Rollback"

## 📚 More Information

See `FIREBASE_HOSTING_GUIDE.md` for detailed documentation.



