import { Router } from "express";
import requireAuth, { CustomRequest } from "../middleware/authMiddleware.js";

const router = Router();

router.post('/auth/verify-token', requireAuth, (req: CustomRequest, res) => {
    // We know req.user exists because the `requireAuth` middleware ran successfully
    const user = req.user!;
    // This endpoint confirms the backend successfully authenticated the user
    res.json({ 
        message: 'Token verified successfully', 
        firebase_uid: user.uid,
        email: user.email,
        isAdmin: user.admin || false // Accessing custom claims (if set)
    });
})

export default router