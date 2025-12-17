import axios from "axios"
import { auth } from "../firebase";
import { FileType } from "../Pages/Home/Home";

const api = axios.create({
    baseURL: "http://localhost:3000/api/v1/files"
})

export const fetchUserFiles = async (idToken: string) => {
    try {
        const response = await api.get('/', {
            headers: {
                Authorization: `Bearer ${idToken}`
            }
        });
        return response.data; // Array of FileType objects
    } catch (error) {
        console.error("Error fetching files:", error);
        throw error;
    }
}

export const uploadSingleFile = async (file: FileType, idToken: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not logged in");
    
    try {
        // 1. Get Signed URL
        const { data } = await api.post('/upload-url', 
            { fileName: file.name, fileType: file.type, fileId: file.id }, 
            { headers: { Authorization: `Bearer ${idToken}` }}
        );
        console.log('/upload-url res: ', data)

        // 2. Upload to GCS
        try {
            const resp = await axios.put(data.uploadUrl, file, {
                headers: { 'Content-Type': file.type },
                // Track progress for this specific file
                onUploadProgress: (p) => console.log(`${file.name}: ${Math.round((p.loaded * 100) / (p.total || 1))}%`)
            });
            console.log("PUT status:", resp.status, resp.statusText);
            console.log("PUT response headers:", resp.headers);
            console.log("PUT response body:", resp.data);
            if (resp.status < 200 || resp.status >= 300) {
                throw new Error(`Upload failed: HTTP ${resp.status}`);
            }
        } catch (e) {
            console.error("Upload PUT error:", e);
            throw e;
        }
    
        // 3. Confirm Metadata
        const res = await api.post('/confirm', 
            { fileId: file.id, gcsPath: data.gcsPath, name: file.name, size: file.size, type: file.type, date: file.date },
            { headers: { Authorization: `Bearer ${idToken}` }}
        );
        console.log('/confirm res: ', res)
        return { name: file.name, fileId: file.id, status: 'success' };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
         // Log error and return a standardized failure object
         console.error(`Upload failed for ${file.name}:`, error?.message ?? error);
         return { 
             name: file.name, 
             fileId: file.id,
             status: 'error', 
             message: error?.response?.data?.error || error?.message || "Connection lost" 
         };
    }
}

/**
 * Handles the batch using Promise.all
 * Even if one fails, we collect the results of all.
 */
export const uploadMultipleFiles = async (files: FileType[], idToken: string) => {
    try {
        const tasks = files.map(file => uploadSingleFile(file, idToken));
        return await Promise.all(tasks);
    } catch (error) {
         // Log error and return a standardized failure object
         console.error('uploadMultipleFiles failed :' , error);
         return { 
             status: 'error', 
             message: String(error) || "Connection lost" 
         };
    }
}