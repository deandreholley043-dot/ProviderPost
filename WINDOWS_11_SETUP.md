# Windows 11 Complete Setup Guide for ProviderPost

## 🎯 Overview

This guide covers everything you need to run ProviderPost on Windows 11, from installation to deployment.

---

## Step 1: Install Required Software

### 1.1 Install Git for Windows
```
1. Go to https://git-scm.com/download/win
2. Download the 64-bit installer
3. Run the installer
4. Accept defaults (just click Next → Next → Finish)
5. Open Command Prompt and verify:
   git --version
   # Should show: git version 2.x.x
```

### 1.2 Install Node.js
```
1. Go to https://nodejs.org
2. Download LTS version (currently 20.x or 22.x)
3. Run installer
4. Accept License Agreement
5. Accept defaults (Next → Next → Finish)
6. Open new Command Prompt and verify:
   node --version
   npm --version
   # Should show versions
```

### 1.3 Install Visual Studio Code (Optional but Recommended)
```
1. Go to https://code.visualstudio.com
2. Download Windows installer
3. Run installer
4. Accept defaults
5. Open VS Code
```

### 1.4 Install GitHub Desktop (Optional - makes Git easier)
```
1. Go to https://desktop.github.com
2. Download and run installer
3. Sign in with your GitHub account
4. This GUI makes GitHub much easier on Windows!
```

---

## Step 2: Extract Your Project

### 2.1 Extract the ZIP File
```
1. Download ProviderPost.zip
2. Right-click the zip file
3. Select "Extract All..."
4. Choose where to extract (e.g., C:\Users\YourName\Documents\)
5. Click "Extract"
```

### 2.2 Navigate to Project Folder
```
1. Open Command Prompt (Win + R, type cmd, press Enter)
2. Type:
   cd C:\Users\YourName\Documents\ProviderPost
   # (Replace YourName with your Windows username)
```

---

## Step 3: Install Dependencies

### 3.1 Install npm Packages
```cmd
npm install
```

This will take a few minutes. You'll see lots of text scrolling - that's normal!

**If you get errors:**
```cmd
# Try clearing npm cache
npm cache clean --force

# Then try again
npm install
```

---

## Step 4: Set Up Environment Variables

### 4.1 Create .env.local File

**Option A: Using Command Prompt (easiest)**
```cmd
# In your project folder:
copy .env.example .env.local
```

**Option B: Using VS Code**
```
1. Open VS Code
2. File → Open Folder → Select ProviderPost
3. Right-click in file explorer → New File
4. Name it: .env.local
5. Paste these variables and fill in yours:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000

CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_ENDPOINT=
CLOUDFLARE_R2_BUCKET_NAME=providerpost
CLOUDFLARE_R2_PUBLIC_URL=

RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@yourdomain.com

NOWPAYMENTS_API_KEY=
NOWPAYMENTS_IPN_SECRET=

CRON_SECRET=
```

---

## Step 5: Run Locally

### 5.1 Start Development Server
```cmd
npm run dev
```

**You should see:**
```
▲ Next.js 16.0.10 (Turbopack)
- Local:        http://localhost:3000
```

### 5.2 Open in Browser
```
1. Open your browser
2. Go to: http://localhost:3000
3. You should see your ProviderPost homepage!
```

### 5.3 Stop the Server
```
Press Ctrl + C in Command Prompt
```

---

## Step 6: Check TypeScript Build

### 6.1 Verify Everything Compiles
```cmd
npm run build
```

**Expected output:**
```
✓ Creating an optimized production build
✓ Compiled successfully
```

If there are errors, run:
```cmd
npm install
npm run build
```

---

## Step 7: Push to GitHub (Windows)

### 7.1 Using GitHub Desktop (Easiest)

**First Time:**
```
1. Open GitHub Desktop
2. Click "File" → "Clone repository"
3. Click "URL" tab
4. Paste your repository URL (from GitHub)
5. Choose local path (e.g., C:\Users\YourName\GitHub\)
6. Click "Clone"
```

**After Making Changes:**
```
1. GitHub Desktop shows changed files
2. Enter commit message (e.g., "Fixed age verification")
3. Click "Commit to main"
4. Click "Push origin" (top right)
5. Done!
```

### 7.2 Using Command Prompt (Alternative)

**First Time Setup:**
```cmd
cd C:\Users\YourName\Documents\ProviderPost

git init
git add .
git commit -m "Initial commit: ProviderPost platform"

# Replace with YOUR GitHub username and repo
git remote add origin https://github.com/YOUR_USERNAME/ProviderPost.git
git branch -M main
git push -u origin main
```

**After Changes:**
```cmd
git add .
git commit -m "Your change description"
git push
```

---

## Step 8: Deploy to Vercel (5 Minutes)

### 8.1 Create Vercel Account
```
1. Go to https://vercel.com
2. Click "Sign Up"
3. Click "Continue with GitHub"
4. Authorize Vercel
```

### 8.2 Deploy Your Project
```
1. Click "Add New..." → "Project"
2. Click "Import Git Repository"
3. Select your ProviderPost repository
4. Vercel shows configuration
5. Add Environment Variables:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - (all the .env.local variables)
6. Click "Deploy"
7. Wait 2-3 minutes
8. You'll get a live URL!
```

### 8.3 Automatic Deployments
Every time you push to GitHub:
```
- Vercel automatically detects changes
- Builds your app
- Deploys to live URL
- Takes ~2-3 minutes
```

---

## 🔧 Common Windows Commands

### Navigation
```cmd
# See current folder
cd

# Go to specific folder
cd C:\Users\YourName\Documents\ProviderPost

# Go up one folder
cd ..

# List files
dir

# Clear screen
cls
```

### Project Commands
```cmd
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Check TypeScript
npx tsc --noEmit

# Check git status
git status

# Commit changes
git commit -m "Your message"

# Push to GitHub
git push
```

---

## 📝 Tips for Windows Users

### 1. Use VS Code Terminal
Instead of Command Prompt:
```
1. Open VS Code
2. Terminal → New Terminal
3. Much better integrated!
```

### 2. Shortcut Keys
```
Win + E          = Open File Explorer
Win + V          = Open Settings
Win + Shift + S  = Screenshot
Win + R          = Run dialog
Ctrl + Shift + Esc = Task Manager
```

### 3. Long Path Issues
If you get path length errors:
```
Windows has 260 character limit for paths
Solution: Extract project closer to root
Example: C:\Dev\ProviderPost (not nested deep)
```

### 4. Port Already in Use
If port 3000 is busy:
```cmd
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
npm run dev -- -p 3001
# Then open http://localhost:3001
```

---

## 🐛 Troubleshooting

### "npm: command not found"
```
Node.js not installed or not in PATH
Solution: Restart Command Prompt after installing Node
```

### "git: command not found"
```
Git not installed properly
Solution: Reinstall Git and restart Command Prompt
```

### "Permission denied"
```
Run Command Prompt as Administrator:
1. Win + X
2. Select "Terminal (Admin)" or "Command Prompt (Admin)"
3. Try command again
```

### Build fails with TypeScript errors
```cmd
# Clear and reinstall
rmdir /s /q node_modules
del package-lock.json
npm install
npm run build
```

### Port 3000 already in use
```cmd
# Use different port
npm run dev -- -p 3001
# Visit http://localhost:3001
```

---

## 📚 Useful Windows Tools

### For Development
- **VS Code** - Code editor (https://code.visualstudio.com)
- **GitHub Desktop** - Git management (https://desktop.github.com)
- **Windows Terminal** - Better terminal (free in Microsoft Store)
- **7-Zip** - File compression (free)

### For Database
- **DBeaver** - Database client (free) (https://dbeaver.io)
- **Postman** - API testing (free) (https://postman.com)

### For Design/Planning
- **Figma** - Design tool (free tier)
- **Notion** - Documentation (free)

---

## 🚀 Your Workflow on Windows 11

### Daily Development
```cmd
# Open Command Prompt or VS Code Terminal
cd C:\Users\YourName\Documents\ProviderPost

# Start development server
npm run dev

# Make changes in VS Code
# Watch as it hot-reloads!

# Press Ctrl + C to stop
```

### When Ready to Push
```cmd
# Using GitHub Desktop (easiest):
1. See changed files in GitHub Desktop
2. Write commit message
3. Click "Commit to main"
4. Click "Push origin"

# Using Command Prompt:
git add .
git commit -m "Your changes"
git push
```

### Deployment
```
- Push to GitHub
- Vercel automatically deploys
- Check https://vercel.com for status
- Your app is live!
```

---

## 📋 Complete Setup Checklist

- [ ] Install Git for Windows
- [ ] Install Node.js LTS
- [ ] Install VS Code (optional)
- [ ] Install GitHub Desktop (optional)
- [ ] Extract ProviderPost.zip
- [ ] Open project folder in Command Prompt
- [ ] Run `npm install`
- [ ] Create `.env.local` with variables
- [ ] Run `npm run dev`
- [ ] Test at http://localhost:3000
- [ ] Run `npm run build`
- [ ] Create GitHub account
- [ ] Create GitHub repository
- [ ] Push code to GitHub
- [ ] Create Vercel account
- [ ] Deploy to Vercel
- [ ] Access live app URL

---

## 🎯 Next Steps

After setup is complete:

1. **Customize** - Update branding, add your domain
2. **Add Data** - Create test users, listings
3. **Configure Services** - Set up Supabase, R2, payments
4. **Test** - Go through user flows
5. **Deploy** - Push live to production

---

## 💡 Pro Tips

### Keep Things Organized
```
C:\Dev\                      (Main dev folder)
├── ProviderPost/            (Your project)
├── Repos/                   (Git repositories)
└── Projects/                (Other projects)
```

### Windows Terminal (Better than Command Prompt)
```
1. Open Microsoft Store
2. Search "Windows Terminal"
3. Click "Install"
4. Much better experience!
```

### GitHub Desktop Features
- Visual diff of changes
- Easy commit and push
- View history
- Create branches easily
- No command line needed!

### Keyboard Shortcuts
```
Ctrl + ` (backtick)  = Toggle VS Code terminal
Ctrl + S             = Save file
Ctrl + Shift + P     = Command palette
Alt + Up/Down        = Move line up/down
```

---

## 📞 Getting Help

If you get stuck:

1. **Read error messages carefully** - They usually tell you the problem
2. **Check documentation** - GITHUB_SETUP_GUIDE.md, COMPLETE_BACKEND_GUIDE.md
3. **Search error on Google** - "npm ERR! 404" etc.
4. **Check Vercel/GitHub status** - Sometimes services are down
5. **Restart services** - Stop npm dev server, restart, try again

---

## ✅ You're Ready!

You now have everything needed to:
- ✅ Run ProviderPost locally
- ✅ Make changes
- ✅ Push to GitHub
- ✅ Deploy to production

**Everything is production-ready. Just configure your services and launch!**

