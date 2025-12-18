# File Manager

A full-stack, secure file management application built with **React**, **Node.js (TypeScript)**, **Firebase** and **Google Cloud Platform**. 

See Live App: https://file-manager-7b2bc.web.app

---
### **What this app can do:**
* **Secure Authentication:** Users sign in safely using their Google accounts via Firebase Authentication.
* **File Listing:** Instantly view a personalized dashboard of uploaded files, with metadata (size, type, date) fetched from Firestore.
* **Direct-to-Cloud Uploads:** Leverages **V4 Signed URLs** to allow users to upload single/multiple files directly from their browser to Google Cloud Storage. This bypasses the backend server for faster, more efficient large-file handling.
* **Secure Downloads:** Generates time-limited, cryptographically signed links for file retrieval, ensuring that files are never publicly exposed.
* **Storage Management:** Provides a seamless interface for deleting files, which automatically synchronizes changes across both the Cloud Storage bucket and the Firestore database.
* **Automatic Scaling:** Built on a serverless architecture (Cloud Run), the application automatically scales to handle traffic spikes without manual intervention.

## Architectural Choices

### **1. Cloud Run vs. Cloud Functions**
I chose **Google Cloud Run** to host the backend Express API instead of Cloud Functions. This decision was based on:
- **Concurrency:** Cloud Run can handle multiple requests per instance, significantly reducing "cold start" latency compared to Cloud Functions.
- **Development Experience:** It allows for a standard Express.js workflow, making it easier to manage complex middleware like CORS and Firebase Admin.
- **Scalability:** It provides automatic scaling while giving more control over the execution environment (RAM/CPU).

### **2. Data Model Decisions (Firestore + GCS)**
The application uses a hybrid storage approach to maximize efficiency:
- **Google Cloud Storage (GCS):** Stores the actual binary file data. Files are isolated by user ID using the path: `uploads/{userId}/{fileId}-{fileName}`.
- **Firestore:** Stores file metadata (GCS path, MIME type, original name). This allows for instant "List Files" queries without the high latency of scanning a storage bucket.

### **3. Signed URLs for Security**
To avoid exposing the private Google Cloud Storage bucket to the public internet, the application uses **V4 Signed URLs**. 
- **Uploads:** The backend generates a temporary "Write" link. The frontend uploads directly to GCS, reducing server load.
- **Downloads:** The backend generates a 5-minute "Read" link, ensuring files are never accessible via a permanent public URL.

---

## Data Model 

The application utilizes a hybrid data model. **Google Cloud Storage (GCS)** handles the physical binary files, while **Cloud Firestore** manages the searchable metadata and ownership logic.

### Files Collection

#### 1. Firestore (Metadata Database)
File records are stored in `files` collection. Each document ID corresponds to a unique `fileId` generated during the upload process.

**Collection:** `/files/{fileId}`

| Field | Type | Description |
| :--- | :--- | :--- |
| `fileId` | `String` | Unique identifier for the file (UUID). |
| `name` | `String` | Original filename (e.g., `invoice.pdf`). |
| `type` | `String` | MIME type (e.g., `application/pdf`). |
| `size` | `Number` | File size in bytes. |
| `gcsPath` | `String` | The full path to the object in the GCS bucket. |
| `userId` | `String` | Firebase UID of the owner (used for access control). |
| `createdAt` | `Timestamp` | Server-side timestamp of when the file was indexed. |

#### 2. Google Cloud Storage (File Storage)
Files are physically stored in a private bucket. The directory structure is designed to isolate user data and prevent filename collisions.

**Storage Path Pattern:**
`uploads/{userId}/{fileId}-{fileName}`

- **Example:** `uploads/user_123/a7b2-99c1-report.docx`

### Users Collection (Extended Profile)
While Firebase Auth handles credentials, this collection stores additional user-specific metadata and application state. Using the Firebase `uid` as the Document ID ensures a 1:1 mapping between authentication and database records.

**Collection:** `/users/{uid}`

| Field | Type | Description |
| :--- | :--- | :--- |
| `uid` | `String` | The unique ID from Firebase Auth (Document ID). |
| `email` | `String` | User's primary email address. |
| `isAdmin` | `Boolean` | User's Role. |
| `displayName` | `String` | User's full name from Google Provider. |
| `photoURL` | `String` | Link to the user's Google profile picture. |
| `storageUsed` | `Number` | Total bytes currently consumed by the user's files. |
| `plan` | `String` | Subscription tier (e.g., `free`, `premium`). |
| `lastLogin` | `Timestamp` | Tracking for account activity and security. |

---

## Setup & Local Development
### Prerequisites
- **Node.js**: v18+ 
- **Firebase CLI**: `npm install -g firebase-tools`
- **Google Cloud SDK**: [Installed and authenticated](https://cloud.google.com/sdk/docs/install)
- **GCP Project**: A project with Billing and Cloud Run enabled.

### 1. Local Environment Variables
You need to create two separate .env files: one for the backend and one for the frontend.

#### Backend (/server/.env)
The backend requires access to your Google Cloud Service Account to interact with Firestore and Storage.

PORT=3000
# Path to the JSON key file downloaded from GCP IAM
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
ALLOWED_ORIGINS='http://localhost:5173,https://file-manager-7b2bc.web.app,https://file-manager-7b2bc.firebaseapp.com'
NODE_ENV="development"
STORAGE_BUCKET_NAME="file-manager-7b2bc.firebasestorage.app"

#### Frontend (/client/.env)
The frontend needs the Firebase configuration to initialize the SDK and the Backend URL to make API calls.

# Use http://localhost:3000 for local dev
VITE_API_URL=http://localhost:3000/api/v1 

### 2. Google Cloud Platform (GCP) Configuration
Before redeploying, ensure your Service Account is correctly configured in the Google Cloud Console.

#### Required IAM Roles
Storage Object Admin: To create and delete files in the bucket.
Service Account Token Creator: Required for generating V4 Signed URLs.
Cloud Datastore User: To read and write metadata to Firestore.
#### CORS Configuration
The browser will block requests if CORS is not configured.
- Your backend code must allow the Firebase Hosting domains (.web.app and .firebaseapp.com).
- Your Storage Bucket may also need a CORS policy if you are performing direct uploads.

### 3. Deployment and CI/CD
This project uses an automated CI/CD pipeline. Any changes pushed to the `release/v1` branch trigger an automatic build and redeployment for both the frontend and backend.
### **1. Automated Workflow**
- **Backend:** Pushing to the repository triggers a Google Cloud Build, which containerizes the Express server and updates the **Cloud Run** service.
- **Frontend:** GitHub Actions (or Firebase App Hosting) builds the React production bundle and deploys it to **Firebase Hosting**.

### **2. Infrastructure Configuration**
Although the deployment is automated, the following cloud settings must be maintained:

#### **IAM Roles (Cloud Run Service Account)**
The Service Account must have these roles for the automated build to function correctly in production:
- **Storage Object Admin**: For file operations.
- **Service Account Token Creator**: For generating V4 Signed URLs.
- **Cloud Datastore User**: For Firestore metadata access.

#### **Firebase Auth "Authorized Domains"**
To prevent "Unauthorized Domain" errors, ensure the following are whitelisted in the Firebase Console:
- `file-manager-7b2bc.web.app`
- `file-manager-7b2bc.firebaseapp.com`
- `file-manager-559044491878.europe-west1.run.app` (Backend URL)

---
