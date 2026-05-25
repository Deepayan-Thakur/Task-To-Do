# 🧠 NeuroList Momentum OS

NeuroList is an ultra-fast, visually stunning, AI-enhanced productivity ecosystem for task management, habit tracking, and deep focus. Built using React, Vite, Tailwind CSS, and Firebase, it features immersive gamification, real-time sync, and second-brain visual note-taking.

---

## 🚀 GitHub & Vercel Deployment Guide

Follow this guide to securely push your repository to your private or public GitHub profile and deploy it on Vercel using environment variables.

### 🔒 Security Check Summary
- ✅ **No Hardcoded API Keys**: All Firebase credentials have been migrated to the secure env pipeline.
- ✅ **`.gitignore` Configured**: Local `.env` and `firebase-applet-config.json` files are automatically kept out of Git tracking.
- ✅ **Environment Variables Ready**: Built-in SPA environment detection with Vite `import.meta.env` client prefix.

---

### 1️⃣ Initializing the GitHub Repository

To push this codebase to GitHub, open your terminal in the project directory and run the following commands:

```bash
# Initialize a new Git repository
git init

# Stage all files (excluding files in .gitignore)
git add .

# Create the initial commit
git commit -m "feat: migrate firebase configuration to environment variables and prep for Vercel deployment"

# Rename default branch to main
git branch -M main

# Add your GitHub repository as the remote origin
# (Replace with your actual GitHub username and repo name)
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git

# Push to your GitHub repository
git push -u origin main
```

---

### 2️⃣ Deploying to Vercel

Vercel makes Vite + React single-page applications incredibly easy to build and host.

1. **Sign In to Vercel**: Head over to [Vercel](https://vercel.com/) and sign in with your GitHub account.
2. **Import Project**: 
   - Click **Add New** -> **Project**.
   - Find your GitHub repository and click **Import**.
3. **Configure Project Settings**:
   - **Framework Preset**: Vercel will automatically detect `Vite`.
   - **Root Directory**: `./` (default).
   - **Build and Output Settings** (Optional Override):
     - If you want Vercel to *only* build the static client-side SPA (recommended for Vercel free tier), you can override the **Build Command** to:
       ```bash
       npm run build
       ```
       or simply:
       ```bash
       vite build
       ```
4. **Configure Environment Variables**:
   Under the **Environment Variables** section, copy and paste the following keys and retrieve their values from your Firebase Project Console (or copy your local values from `.env`):

   | Variable Key | Purpose |
   |--------------|---------|
   | `VITE_FIREBASE_API_KEY` | Your Firebase Web App API Key |
   | `VITE_FIREBASE_PROJECT_ID` | Your Firebase Project ID |
   | `VITE_FIREBASE_APP_ID` | Your Firebase Web App ID |
   | `VITE_FIREBASE_AUTH_DOMAIN` | Your Firebase Auth domain `[project-id].firebaseapp.com` |
   | `VITE_FIREBASE_DATABASE_ID` | Firestore Database ID (`(default)` or custom specific ID) |
   | `VITE_FIREBASE_STORAGE_BUCKET` | Your Firebase storage bucket |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID |
   | `VITE_FIREBASE_MEASUREMENT_ID` | (Optional) Firebase Analytics Measurement ID |

5. **Deploy!**
   - Click the **Deploy** button. Vercel will build your static files and deploy them globally to their Edge network.

---

## 🛠️ Local Development

To run this project locally:

1. Clone your GitHub repository.
2. Duplicate `.env.example` as `.env` and fill in your Firebase configuration keys.
3. Install the dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

---

## 🎨 Core Functional Modules
- **Focus Register**: Organize your task pipeline with priority mapping (Critical, High, Medium, Low).
- **Calendar Orbits**: Map focus workloads across custom grid dates to schedule roadmap milestones.
- **Routine Catalyst**: Form daily habit loops with integrated consistency heatmaps (with GitHub-style contributions style) and daily streak counts.
- **State Zero Timer (Focus Mode)**: Deep Pomodoro or free stopwatch flow sessions incorporating built-in alpha-wave binaural sound generators.
- **Notes Vault**: Integrated knowledge notes supporting recursive backlinks.
- **Insights Matrix (Analytics)**: High-fidelity analytics charts powered by `recharts`.
