import multer from "multer";


// Vercel-safe multer config using memory storage
const storage = multer.memoryStorage();

const upload = multer({ storage });

export default upload;