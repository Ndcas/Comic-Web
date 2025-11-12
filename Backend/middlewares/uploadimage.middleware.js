const multer = require('multer');
const path = require('path');

const MIME_TYPES = process.env.MIME_TYPES.split(',');
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE);
const MAX_FILE_PER_UPLOAD = parseInt(process.env.MAX_FILE_PER_UPLOAD);

function generateFileName(originalName) {
    let today = new Date();
    let year = today.getFullYear().toString();
    let month = (today.getMonth() + 1).toString().padStart(2, '0');
    let date = today.getDate().toString().padStart(2, '0');
    let hours = today.getHours().toString().padStart(2, '0');
    let minutes = today.getMinutes().toString().padStart(2, '0');
    let seconds = today.getSeconds().toString().padStart(2, '0');
    let random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    let parsedPath = path.parse(originalName);
    let extension = parsedPath.ext;
    let slicedName = parsedPath.name.slice(0, 69);
    return `${slicedName}_${hours}${minutes}${seconds}_${date}${month}${year}_${random}${extension}`;
}

const storageAnhBia = multer.diskStorage({
    destination: './assets/covers',
    filename: (req, file, cb) => {
        cb(null, generateFileName(file.originalname));
    }
});

const storageHinhAnh = multer.diskStorage({
    destination: './assets/images',
    filename: (req, file, cb) => {
        cb(null, generateFileName(file.originalname));
    }
});

const uploadAnhBia = multer({
    storage: storageAnhBia,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
        if (!MIME_TYPES.includes(file.mimetype)) {
            cb(null, false);
        } else {
            cb(null, true);
        }
    }
}).single('AnhBia');

const uploadHinhAnh = multer({
    storage: storageHinhAnh,
    limits: {
        fileSizeL: MAX_FILE_SIZE,
        files: MAX_FILE_PER_UPLOAD
    },
    fileFilter: (req, file, cb) => {
        if (!MIME_TYPES.includes(file.mimetype)) {
            cb(null, false);
        } else {
            cb(null, true);
        }
    }
}).array('HinhAnh');

module.exports = { uploadAnhBia, uploadHinhAnh };