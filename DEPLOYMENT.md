# React Deployment and Selenium E2E Testing Documentation

This guide outlines the steps to deploy the EcoTrade React frontend to GitHub Pages and integrate Selenium-based end-to-end (E2E) automation testing.

---

## Step 1 — Push Your React Project to GitHub
Inside your project folder:

```bash
git init
git add .
git commit -m "Initial frontend upload"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```
*Replace `YOUR_USERNAME` and `YOUR_REPO` with your actual GitHub details.*

---

## Step 2 — Install GitHub Pages Package
Inside the project:

```bash
npm install gh-pages --save-dev
```

---

## Step 3 — Update package.json
Open `package.json`.

Add your homepage configuration:
```json
"homepage": "https://YOUR_USERNAME.github.io/YOUR_REPO",
```

Inside the `"scripts"` object, add deployment configurations:
```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```
> [!NOTE]
> **Vite build path**: Unlike Create React App (which outputs to `build`), this project is powered by Vite and builds to the `dist` directory. Thus, the deploy command is configured with `dist` (`gh-pages -d dist`).

---

## Step 4 — Deploy React Project to GitHub Pages
Inside the project folder run:

```bash
npm run deploy
```
This command:
- Builds the React application into the `dist` folder
- Creates a production build
- Uploads the build assets directly to the `gh-pages` branch on GitHub

---

## Step 5 — Enable GitHub Pages
1. Open your GitHub repository in your web browser.
2. Navigate to **Settings** &rarr; **Pages**.
3. Under **Build and deployment**:
   - Select **Source** &rarr; **Deploy from branch**.
   - Choose **Branch** &rarr; **gh-pages**.
4. Click **Save**.

---

## Step 6 — Access the Live Application
After deployment, GitHub provides your live URL:
```
https://YOUR_USERNAME.github.io/YOUR_REPO
```

---

## Step 7 — Configure React Router for GitHub Pages (If Applicable)
If your app utilizes `react-router-dom` for client-side routing, replace your default `BrowserRouter` with `HashRouter` to prevent `404 Page Not Found` errors when refreshing pages on static hosts.

Replace:
```typescript
import { BrowserRouter } from 'react-router-dom';
```
With:
```typescript
import { HashRouter } from 'react-router-dom';
```
Then update:
```tsx
<BrowserRouter>
  <App />
</BrowserRouter>
```
To:
```tsx
<HashRouter>
  <App />
</HashRouter>
```

---

## Step 8 — Rebuild and Redeploy
If you make router or config changes:

```bash
npm run build
npm run deploy
```

---

## Step 9 — Verify Deployment
Test:
- Homepage loads
- Login page works
- Refresh works
- Direct URL access works (e.g., `https://USERNAME.github.io/REPO/#/login`)

---

## Step 10 — Add Selenium E2E Testing
Install Selenium and Mocha test framework dependencies:

```bash
npm install selenium-webdriver mocha --save-dev
```

---

## Step 11 — Create Selenium Test Structure
Recommended structure:

```
ECO-Trade-app-main/
│
├── selenium-tests/
│   ├── tests/
│   │   └── login.test.js
│   └── package.json
```

---

## Step 12 — Add Stable IDs for Automation
Make sure the target input fields and buttons have unique, stable `id` properties in the source files. For example:

```html
<input id="email" />
<input id="password" />
<button id="login-button" />
```
This allows Selenium locators to find elements reliably even when layout styling changes.

---

## Step 13 — Run Selenium Test Locally
Define a script under `"scripts"` in your `package.json`:
```json
"login": "mocha selenium-tests/tests/login.test.js --timeout 15000"
```

Then run:
```bash
npm run login
```
This:
- Opens a Chrome window (or runs headlessly)
- Navigates to the login page on localhost
- Enters mock/test credentials
- Validates that the user dashboard is successfully reached

---

## Step 14 — Setup GitHub Actions
Create a workflow configuration file `.github/workflows/selenium-login.yml` to automatically run tests in CI:

```yaml
name: Selenium Login E2E Validation

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Install Dependencies
        run: npm install

      - name: Build Application
        run: npm run build

      - name: Start Server and Run Tests
        run: |
          npm run dev &
          npx wait-on http://localhost:3000
          npm run login
```

---

## Step 15 — Automatic CI/CD Testing
Whenever code is pushed:

```bash
git push
```
GitHub Actions automatically triggers:
- Build validation
- Selenium E2E tests
- Status reports

---

## Final Pipeline Architecture
```
Developer Push
      ↓
GitHub Repository
      ↓
GitHub Actions Trigger
      ↓
Selenium E2E Testing
      ↓
Production Validation
      ↓
Pass / Fail Report
```
