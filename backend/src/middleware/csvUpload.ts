import multer from 'multer';

// Memory storage for small CSV uploads
const storage = multer.memoryStorage();

export const uploadCsv = multer({ storage });
