import { Response } from "express";
import { bucket, db } from "../config/firebaseAdmin.js"
import { AuthRequest } from "../middleware/authMiddleware.js";
import { v4 as uuidv4 } from 'uuid';
import { QueryDocumentSnapshot } from "firebase-admin/firestore";

export const listAllFiles = async (req: AuthRequest, res: Response) => {
  try {
      const userId = req.user?.uid;
    const userRole = req.user?.role; // Set by your auth middleware
    let filesQuery: any = db.collection('files');

    // Security Gate: If not admin, restrict to owner
    if (userRole !== 'admin') {
      filesQuery = filesQuery.where('userId', '==', userId);
    }
    // Sort by newest first
    const snapshot = await filesQuery.get();
    const files = snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json(files);

    } catch (error) {
        console.error("listAllFiles error:", error)
        res.status(500).json({ error: "Could not retrieve files" });
    }
}

// STEP 1: Generate a Signed URL for a single file
export const getUploadUrl = async (req: AuthRequest, res: Response) => {
  try {
    const { fileName, fileType, fileId } = req.body;
    const gcsPath = `uploads/${req.user?.uid}/${fileId}-${fileName}`;

    const [url] = await bucket.file(gcsPath).getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 mins
      contentType: fileType,
    });

    res.json({ uploadUrl: url, gcsPath, fileId });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate signed URL" });
  }
};

// STEP 2: Save to Firestore after successful GCS upload
export const confirmUpload = async (req: AuthRequest, res: Response) => {
  try {
    const { fileId, name, size, type, gcsPath, date } = req.body;

    await db.collection('files').doc(fileId).set({
      name,
      size,
      type,
      gcsPath,
      userId: req.user?.uid,
      createdAt: new Date().toISOString(),
      date,
    });

    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to save file metadata" });
  }
};