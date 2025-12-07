
/**
 Import JSON files from ./exports/ into Firestore.
 Usage: node scripts/import_all.js
 WARNING: This will overwrite documents with same IDs in the target Firestore.
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
const inDir = path.join(__dirname, '..', 'exports');
if (!fs.existsSync(inDir)) {
  console.error('exports/ directory not found. Put JSON files there.');
  process.exit(1);
}

async function importCollections() {
  const files = fs.readdirSync(inDir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const colName = path.basename(file, '.json');
    const data = JSON.parse(fs.readFileSync(path.join(inDir, file)));
    const colRef = db.collection(colName);
    const batchArray = [];
    let batch = db.batch();
    let opCount = 0;
    for (const [docId, docData] of Object.entries(data)) {
      const docRef = colRef.doc(docId);
      batch.set(docRef, docData);
      opCount++;
      if (opCount === 500) { // commit batch
        await batch.commit();
        batch = db.batch();
        opCount = 0;
      }
    }
    if (opCount > 0) await batch.commit();
    console.log('Imported collection', colName);
  }
  console.log('All imports done.');
}

importCollections().catch(err => {
  console.error(err);
  process.exit(1);
});
