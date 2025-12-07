
# Swadhin Backend Restore Scaffold

**What this is:**  
A ready Node.js + Express scaffold that helps you export and import Firestore data.  
It does NOT include your Firebase credentials. You must add them.

**Files to add before use**
1. `serviceAccountKey.json` — your Firebase Admin SDK service account key (place at the project root).
2. `.env` — environment file with:
   ```
   FIREBASE_PROJECT_ID=your-project-id
   ```
**How to use**
1. `npm install`
2. Export all collections to `exports/`:
   ```
   npm run export
   ```
3. Import from `exports/`:
   ```
   npm run import
   ```

**Notes**
- The export/import scripts are simple and meant for small-to-medium datasets.
- Test on a separate Firebase project before touching production.
- If you want, I can customize this to match your site's specific collections/structure.
