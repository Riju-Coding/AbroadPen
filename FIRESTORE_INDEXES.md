# Required Firestore Composite Indexes

This document lists the composite indexes required for your Firestore queries.

## Why are these needed?

Firestore requires composite indexes when you combine `where()` filters with `orderBy()` in a single query. These indexes optimize query performance and are automatically managed by Firebase.

## How to create indexes

When you see an error in the console about missing indexes, click the provided link in the error message. This will take you directly to the Firebase Console where you can create the index with a single click.

Alternatively, you can create them manually:

### For States Collection

**Index 1: States by Country (sorted by name)**
- Collection: `states`
- Fields:
  - `countryId` (Ascending)
  - `name` (Ascending)

Direct link format (replace `YOUR_PROJECT_ID`):
\`\`\`
https://console.firebase.google.com/project/YOUR_PROJECT_ID/firestore/indexes?create_composite=STATES_COMPOSITE_INDEX
\`\`\`

### For Cities Collection

**Index 2: Cities by State (sorted by name)**
- Collection: `cities`
- Fields:
  - `stateId` (Ascending)
  - `name` (Ascending)

Direct link format (replace `YOUR_PROJECT_ID`):
\`\`\`
https://console.firebase.google.com/project/YOUR_PROJECT_ID/firestore/indexes?create_composite=CITIES_COMPOSITE_INDEX
\`\`\`

## Quick Setup Instructions

1. Go to your Firebase Console
2. Navigate to: **Firestore Database → Indexes**
3. Click **Create Index**
4. Enter the collection name and fields as listed above
5. Click **Create**

## Alternative: Use Error Links

The easiest way is to let the app generate the error, then click the link provided in the error message. Firebase will pre-fill all the correct values for you.

## Index Status

Once created, indexes typically take a few minutes to build. You can check their status in the Firebase Console under Firestore → Indexes.
