
/**
 Export all top-level collections to JSON files in ./exports/
 Usage: node scripts/export_all.js
*/
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

if (!admin.apps.length) {
  const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
  if (!fs.existsSync(serviceAccountPath)) {
    console.error('serviceAccountKey.json not found. Put it in project root.');
    process.exit(1);
  }
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id
  });
}

const db = admin.firestore();
const outDir = path.join(__dirname, '..', 'exports');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

async function exportCollections() {
  const collections = await db.listCollections();
  for (const col of collections) {
    const snapshot = await col.get();
    const docs = {};
    snapshot.forEach(doc => {
      docs[doc.id] = doc.data();
    });
    fs.writeFileSync(path.join(outDir, col.id + '.json'), JSON.stringify(docs, null, 2));
    console.log('Exported', col.id, '->', col.size, 'documents');
  }
  console.log('All done. Files are in exports/');
}

exportCollections().catch(err => {
  console.error(err);
  process.exit(1);
});
