import axios from "axios"
import { auth } from "../firebaseConfig";
import { FileType } from "../Pages/Home/Home";
import api from "./api";

export const fetchUserFiles = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not logged in");
    try {
        const response = await api.get('/files');
        return response.data; // Array of FileType objects
    } catch (error) {
        console.error("Error fetching files:", error);
        throw error;
    }
}

export const uploadSingleFile = async (file: FileType) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not logged in");
    
    try {
        // 1. Get Signed URL
        const { data } = await api.post('/files/upload-url', 
            { fileName: file.name, fileType: file.type, fileId: file.id }
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
        const res = await api.post('/files/confirm', 
            { fileId: file.id, gcsPath: data.gcsPath, name: file.name, size: file.size, type: file.type, date: file.date });
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
export const uploadMultipleFiles = async (files: FileType[]) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not logged in");
    try {
        const tasks = files.map(file => uploadSingleFile(file));
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


export const downloadFile = async (fileId: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not logged in");
    try {
        const { data } = await api.get(`/files/${fileId}/download-url`)
        return { ...data, status: 'success' };
    } catch (error) {
        console.error('download file failed :', error);
        return { 
            status: 'error', 
            message: String(error) || "Connection lost" 
        };
    }
}

export const deleteFile = async (fileId: string) => {
    try {
        const res = await api.delete(`/files/${fileId}`)
        return { ...res, status: 'success' };
    } catch (error) {
        console.error('delete file failed :', error);
        return { 
            status: 'error', 
            message: String(error) || "Connection lost" 
        };
    }

}