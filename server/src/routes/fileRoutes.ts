import { Router } from "express";
import {requireAuth, identifyRole} from "../middleware/authMiddleware.js";
import * as fileController from "../controllers/fileController.js"

const router = Router();

// RequireAuth to all file routes
router.use(requireAuth)

// USER: List own files | Admin: List all files
router.get('/', identifyRole, fileController.listAllFiles)

// USER & ADMIN: Request Signed URL for upload
router.post('/upload-url', fileController.getUploadUrl);

// // USER & ADMIN: Confirm metadata after upload is complete
router.post('/confirm', fileController.confirmUpload);

// // Specific File Operations
// router.get('/:id', fileController.getFileDetails);
// router.get('/:id/download', fileController.getDownloadUrl);
// router.delete('/:id', fileController.deleteFile);
router
.route('/')

export default router