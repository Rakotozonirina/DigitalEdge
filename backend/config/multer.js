const fs = require('fs');
const path = require('path');
const multer = require('multer');

const ensureUploadDir = (folderName) => {
  const uploadPath = path.join(__dirname, '..', 'uploads', folderName);
  fs.mkdirSync(uploadPath, { recursive: true });
  return uploadPath;
};

const sanitizeFilename = (filename) => {
  const extension = path.extname(filename);
  const basename = path.basename(filename, extension).replace(/[^a-zA-Z0-9-_]/g, '-');

  return `${basename}-${Date.now()}${extension}`;
};

const createDiskStorage = (folderName) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, ensureUploadDir(folderName));
    },
    filename: (req, file, cb) => {
      cb(null, sanitizeFilename(file.originalname));
    },
  });

const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
    return;
  }

  cb(new Error('Seules les images sont autorisees pour ce champ.'));
};

const attachmentFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'application/x-zip-compressed',
    'text/plain',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(new Error('Type de fichier non autorise pour les pieces jointes.'));
};

const uploadServiceImage = multer({
  storage: createDiskStorage('services'),
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadOrderAttachments = multer({
  storage: createDiskStorage('orders'),
  fileFilter: attachmentFileFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
});

module.exports = {
  uploadServiceImage,
  uploadOrderAttachments,
};
