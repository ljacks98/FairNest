#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

function printUsage() {
  console.log(`
Usage:
  node functions/scripts/set-admin.js --email user@example.com --admin true
  node functions/scripts/set-admin.js --uid FIREBASE_UID --admin false

Options:
  --email   User email to update
  --uid     Firebase Auth UID to update
  --admin   true to grant admin, false to remove admin

Credentials:
  Set GOOGLE_APPLICATION_CREDENTIALS to a Firebase service account JSON file,
  or authenticate with application default credentials before running this script.
`);
}

function readOption(argv, name) {
  const index = argv.indexOf(name);
  if (index === -1 || index === argv.length - 1) {
    return null;
  }

  return argv[index + 1];
}

function parseAdminFlag(value) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new Error('The --admin flag must be either true or false.');
}

function loadServiceAccount(filePath) {
  const resolvedPath = path.resolve(filePath);
  const fileContents = fs.readFileSync(resolvedPath, 'utf8');
  return JSON.parse(fileContents);
}

function initializeAdmin() {
  if (admin.apps.length > 0) {
    return;
  }

  const serviceAccountPath =
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    process.env.FIREBASE_SERVICE_ACCOUNT;

  if (serviceAccountPath) {
    const serviceAccount = loadServiceAccount(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    return;
  }

  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

async function findUser({ email, uid }) {
  if (email) {
    return admin.auth().getUserByEmail(email);
  }

  return admin.auth().getUser(uid);
}

async function setAdminRole(userRecord, makeAdmin) {
  const currentClaims = userRecord.customClaims || {};
  const nextClaims = { ...currentClaims };

  if (makeAdmin) {
    nextClaims.admin = true;
  } else {
    delete nextClaims.admin;
  }

  await admin
    .auth()
    .setCustomUserClaims(
      userRecord.uid,
      Object.keys(nextClaims).length > 0 ? nextClaims : null
    );
}

async function mirrorRoleToFirestore(userRecord, makeAdmin) {
  await admin
    .firestore()
    .collection('users')
    .doc(userRecord.uid)
    .set(
      {
        email: userRecord.email || null,
        role: makeAdmin ? 'admin' : 'user',
        claimsUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
}

async function main() {
  const argv = process.argv.slice(2);

  if (argv.includes('--help') || argv.includes('-h')) {
    printUsage();
    return;
  }

  const email = readOption(argv, '--email');
  const uid = readOption(argv, '--uid');
  const adminFlag = readOption(argv, '--admin');

  if ((!email && !uid) || (email && uid)) {
    throw new Error('Provide exactly one of --email or --uid.');
  }

  if (!adminFlag) {
    throw new Error('Missing required --admin flag.');
  }

  const makeAdmin = parseAdminFlag(adminFlag);

  initializeAdmin();

  const userRecord = await findUser({ email, uid });
  await setAdminRole(userRecord, makeAdmin);
  await mirrorRoleToFirestore(userRecord, makeAdmin);

  console.log(
    `${makeAdmin ? 'Granted' : 'Removed'} admin for ${userRecord.email || userRecord.uid}.`
  );
  console.log(`UID: ${userRecord.uid}`);
  console.log(`Firestore role mirrored to users/${userRecord.uid}.`);
  console.log(
    'The user should sign out and sign back in before testing admin access.'
  );
}

main().catch((error) => {
  console.error('set-admin failed:', error.message);

  if (
    error.message.includes('Could not load the default credentials') ||
    error.message.includes('credential implementation')
  ) {
    console.error(
      'Tip: set GOOGLE_APPLICATION_CREDENTIALS to your Firebase service account JSON file.'
    );
  }

  process.exitCode = 1;
});
