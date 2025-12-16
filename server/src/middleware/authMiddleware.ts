import { NextFunction, Request, Response } from "express"
import {auth, db} from "../config/firebase-admin.js"
import { DecodedIdToken } from "firebase-admin/auth";

export interface CustomRequest extends Request {
  user?: DecodedIdToken;
}

const requireAuth = async (req: CustomRequest, res: Response, next: NextFunction) => {
    // 1. Check for the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization token not provided or format incorrect' });
    }
    // 2. Extract the ID Token
    const idToken = authHeader.split(' ')[1];

    try {
        if (!idToken) {
            return res.status(401).json({ error: 'Unauthorized: missing Firebase ID token'});
        }
        // 3. Verify the ID Token using the Admin SDK
        const decodedToken = await auth.verifyIdToken(idToken);

        // 4. Attach the user object to the request for subsequent handlers
        req.user = decodedToken;
        if (req.user) {
            console.log(`User ${req.user.uid} verified.`);
        }
    
        next(); // Proceed to the route handler
    } catch (error) {
        // TypeScript-friendly error handling
        console.error("Token verification failed:", (error as Error).message);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

export default requireAuth;