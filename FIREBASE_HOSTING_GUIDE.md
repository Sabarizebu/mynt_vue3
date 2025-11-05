# Firebase Hosting Guide - SuperApp v4

This guide will help you deploy the SuperApp v4 Vue 3 application to Firebase Hosting.

## Prerequisites

1. **Firebase CLI**: Already installed (check with `firebase --version`)
2. **Firebase Account**: Login to Firebase Console (https://console.firebase.google.com)
3. **Node.js**: Required for building the app

## Project Configuration

- **Firebase Project**: `app-mynt`
- **Build Output**: `dist` (Vite default)
- **Configuration Files**: `firebase.json` and `.firebaserc` (already configured)

## Step-by-Step Deployment

### Step 1: Install Firebase CLI (if not already installed)

```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase

```bash
firebase login
```

This will open a browser window for authentication.

### Step 3: Verify Firebase Project

```bash
firebase projects:list
```

Ensure `app-mynt` is listed.

### Step 4: Set Firebase Project (if needed)

```bash
firebase use app-mynt
```

### Step 5: Build the Application

Build the Vue 3 app for production:

```bash
npm run build
```

This will create a `dist` folder with optimized production files.

### Step 6: Test Locally (Optional)

Test the production build locally:

```bash
npm run firebase:serve
```

Or use Vite preview:

```bash
npm run preview
```

### Step 7: Deploy to Firebase Hosting

Deploy the application:

```bash
npm run firebase:deploy
```

Or directly:

```bash
firebase deploy --only hosting
```

## Deployment Commands

### Quick Deploy
```bash
npm run build && npm run firebase:deploy
```

### Deploy with Preview
```bash
npm run build && firebase deploy --only hosting --project app-mynt
```

### Deploy to Preview Channel
```bash
firebase hosting:channel:deploy preview
```

## Firebase Configuration Files

### firebase.json
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
    ]
  }
}
```

### .firebaserc
```json
{
  "projects": {
    "default": "app-mynt"
  }
}
```

## Post-Deployment

After deployment, your app will be available at:
- **Production URL**: `https://app-mynt.web.app`
- **Alternative URL**: `https://app-mynt.firebaseapp.com`

## Custom Domain Setup (Optional)

1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Follow the DNS configuration instructions
4. Verify domain ownership

## Environment-Specific Deployments

### Development Build
```bash
npm run build
firebase deploy --only hosting --project app-mynt
```

### Staging Build
```bash
npm run build:staging  # if configured
firebase deploy --only hosting --project app-mynt-staging
```

## Troubleshooting

### Build Errors
- Ensure all dependencies are installed: `npm install`
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run lint`

### Deployment Errors
- Verify Firebase project: `firebase use app-mynt`
- Check Firebase login: `firebase login`
- Verify build output exists: `ls -la dist`

### Routing Issues
- Ensure `firebase.json` has the rewrite rule for SPA routing
- Verify all routes redirect to `/index.html`

## Build Optimization

The Vite build is already optimized for production:
- Code splitting
- Tree shaking
- Minification
- Asset optimization

## Monitoring

After deployment, monitor:
- Firebase Console → Hosting → Usage
- Firebase Console → Analytics
- Browser console for errors

## Rollback

To rollback to a previous version:
1. Go to Firebase Console → Hosting
2. Click on the deployment
3. Click "Rollback"

## CI/CD Integration (Optional)

### GitHub Actions Example

```yaml
name: Deploy to Firebase
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: app-mynt
```

## Security Headers (Optional)

Add to `firebase.json`:

```json
{
  "hosting": {
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

## Performance Tips

1. **Enable Compression**: Firebase automatically compresses assets
2. **CDN**: Firebase Hosting uses Google's CDN
3. **Caching**: Configure cache headers in `firebase.json`
4. **Lazy Loading**: Already implemented in Vue Router

## Next Steps

1. ✅ Build the application
2. ✅ Deploy to Firebase
3. ✅ Verify deployment
4. ✅ Set up custom domain (optional)
5. ✅ Configure CI/CD (optional)
6. ✅ Monitor analytics

## Support

For issues:
- Firebase Documentation: https://firebase.google.com/docs/hosting
- Firebase Support: https://firebase.google.com/support


