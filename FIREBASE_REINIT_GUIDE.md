# Firebase Reinitialization Guide

This guide will help you reinitialize Firebase for your Vue 3 application.

## Step-by-Step Reinitialization

### Step 1: Backup Current Configuration (Optional)

If you want to keep your current settings:
```bash
cp firebase.json firebase.json.backup
cp .firebaserc .firebaserc.backup
```

### Step 2: Remove Existing Firebase Configuration

```bash
rm firebase.json .firebaserc
```

### Step 3: Initialize Firebase

Run the Firebase initialization command:
```bash
firebase init
```

### Step 4: Interactive Setup

When you run `firebase init`, you'll be prompted with the following:

#### 1. Select Features
- Use arrow keys to navigate
- Use spacebar to select/deselect
- Select: **Hosting** (for hosting your Vue app)
- Press Enter to continue

#### 2. Select Project
You'll see options:
- **Use an existing project** (recommended if you have `app-mynt`)
- **Create a new project**
- **Add Firebase to an existing Google Cloud Platform project**

Choose: **Use an existing project**

#### 3. Select Project Name
- Select: **app-mynt** (or your project name)
- Press Enter

#### 4. Public Directory
- Enter: **dist**
- Press Enter
(This is where Vite builds your production files)

#### 5. Configure as Single-Page App
- Question: "Configure as a single-page app (rewrite all urls to /index.html)?"
- Answer: **Yes** (y)
- Press Enter

#### 6. Set Up Automatic Builds
- Question: "Set up automatic builds and deploys with GitHub?"
- Answer: **No** (n) - unless you want CI/CD
- Press Enter

#### 7. File Overwrite
- Question: "File firebase.json already exists. Overwrite?"
- Answer: **Yes** (y)
- Press Enter

### Step 5: Verify Configuration

After initialization, verify the files:

```bash
cat firebase.json
cat .firebaserc
```

### Expected Output

**firebase.json** should look like:
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

**.firebaserc** should look like:
```json
{
  "projects": {
    "default": "app-mynt"
  }
}
```

### Step 6: Test Configuration

```bash
# Verify project
firebase use

# List projects (optional)
firebase projects:list
```

### Step 7: Build and Deploy

```bash
# Build the app
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

## Quick Reinitialization Script

If you want to automate the process (after manual `firebase init`):

```bash
# Reset Firebase config
rm firebase.json .firebaserc

# Reinitialize (interactive)
firebase init hosting
```

## Troubleshooting

### Issue: "Firebase CLI not found"
```bash
npm install -g firebase-tools
```

### Issue: "Not logged in"
```bash
firebase login
```

### Issue: "Project not found"
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or verify existing project
3. Run `firebase init` again

### Issue: "Permission denied"
1. Check Firebase Console → Project Settings → Users
2. Ensure your account has editor/admin permissions
3. Try: `firebase logout` then `firebase login`

## Manual Configuration (Alternative)

If you prefer to manually create the files:

### Create firebase.json
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

### Create .firebaserc
```json
{
  "projects": {
    "default": "app-mynt"
  }
}
```

Replace `app-mynt` with your Firebase project ID.

## Next Steps

After reinitialization:
1. ✅ Build your app: `npm run build`
2. ✅ Test locally: `firebase serve`
3. ✅ Deploy: `firebase deploy --only hosting`
4. ✅ Verify: Visit your Firebase hosting URL

## Support

- Firebase Docs: https://firebase.google.com/docs/hosting
- Firebase CLI: https://firebase.google.com/docs/cli



