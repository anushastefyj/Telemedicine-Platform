const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const fs = require('fs');
const path = require('path');

const isMock = !process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY === 'mock_key';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'mock_cloud',
  api_key: process.env.CLOUDINARY_API_KEY || 'mock_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'mock_secret',
});

const uploadDir = path.join(__dirname, '../../uploads');
if (isMock && !fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

let storage, profileStorage;

if (isMock) {
  function CustomDiskStorage() {}
  CustomDiskStorage.prototype._handleFile = function(req, file, cb) {
    const filename = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
    const finalPath = path.join(uploadDir, filename);
    const outStream = fs.createWriteStream(finalPath);
    file.stream.pipe(outStream);
    outStream.on('error', cb);
    outStream.on('finish', function() {
      cb(null, {
        destination: uploadDir,
        filename: filename,
        path: `http://localhost:5000/uploads/${filename}`, // Mocked URL
        size: outStream.bytesWritten
      });
    });
  };
  CustomDiskStorage.prototype._removeFile = function(req, file, cb) {
    fs.unlink(path.join(uploadDir, file.filename), cb);
  };

  storage = new CustomDiskStorage();
  profileStorage = new CustomDiskStorage();
} else {
  // ── Medical Records Storage ──────────────────────────
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'telemedicine_records',
      allowed_formats: ['jpg', 'png', 'pdf', 'jpeg', 'webp'],
      resource_type: 'auto',
    },
  });

  // ── Profile Photo Storage ────────────────────────────
  profileStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'telemedicine_profiles',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
      resource_type: 'image',
      transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
    },
  });
}

// File filter — allows only PDFs and images
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'application/pdf' ||
    file.mimetype.startsWith('image/')
  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type, only PDFs and images are allowed!'), false);
  }
};

// Profile photo filter — images only
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed for profile photos!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

const profileUpload = multer({
  storage: profileStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

module.exports = {
  cloudinary,
  upload,
  profileUpload,
};

