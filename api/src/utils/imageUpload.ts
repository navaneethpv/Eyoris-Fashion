// /api/src/utils/imageUpload.ts

import cloudinary from '../config/cloudinary';
import axios from 'axios';
import getColors from 'get-image-colors';
// Minimal ambient declaration to satisfy TypeScript
// Minimal typed wrapper for the untyped 'streamifier' package
type Streamifier = { createReadStream(buffer: Buffer): NodeJS.ReadableStream };
const streamifier = require('streamifier') as Streamifier;

// Define a clear type for the return value
export interface ImageAnalysisResult {
    url: string;
    colorData: {
        hex: string;
        rgb: { r: number; g: number; b: number };
    };
}

// This function now correctly returns the full colorData object
export const uploadImageBuffer = (buffer: Buffer): Promise<ImageAnalysisResult> => {
    return new Promise(async (resolve, reject) => {
        try {
            const colors = await getColors(buffer, { count: 1 });
            const dominantColor = colors[0];
            const colorData = {
                hex: dominantColor.hex(),
                rgb: { r: dominantColor.rgb()[0], g: dominantColor.rgb()[1], b: dominantColor.rgb()[2] }
            };

            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'eyoris/products' },
                (error, result) => {
                    if (error || !result) return reject(error || new Error('Cloudinary upload failed.'));
                    resolve({ url: result.secure_url, colorData });
                }
            );
            streamifier.createReadStream(buffer).pipe(uploadStream);

        } catch (error) {
            reject(error);
        }
    });
};

// This function also returns the full colorData object
export const analyzeImageUrl = async (url: string): Promise<ImageAnalysisResult> => {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data, 'binary');
        // Re-use the function above to avoid duplicating code
        return await uploadImageBuffer(buffer);
    } catch (error) {
        console.error('Failed to analyze image URL:', error);
        throw error;
    }
};