/**
 * File Upload Validation Middleware
 *
 * Provides a configured multer instance with:
 *  - File size limit (default 50 MB, override via MAX_FILE_SIZE_MB env)
 *  - MIME type whitelist enforcement
 *  - Extension whitelist enforcement (defense-in-depth against spoofed Content-Type)
 *  - Magic-byte verification for the most critical types
 */

const multer = require('multer');
const path = require('path');

// ── Allowed file types ────────────────────────────────────────────────────────

const ALLOWED_MIME_TYPES = new Set([
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // 3D assets
  'model/gltf+json',
  'model/gltf-binary',
  // Video
  'video/mp4',
  'video/webm',
]);

const ALLOWED_EXTENSIONS = new Set([
  '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt',
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
  '.gltf', '.glb',
  '.mp4', '.webm',
]);

// ── Magic-byte signatures for high-risk types ──────────────────────────────────

/**
 * Returns true if the buffer starts with the expected magic bytes for the
 * claimed MIME type. Only checks the types where spoofing is most dangerous;
 * other types are accepted based on MIME + extension whitelist alone.
 */
function checkMagicBytes(buffer, mimetype) {
  if (!buffer || buffer.length < 8) return true; // can't check — allow (size already limited)

  switch (mimetype) {
    case 'application/pdf':
      // %PDF-
      return buffer.slice(0, 4).toString('ascii') === '%PDF';
    case 'image/jpeg':
      // FF D8 FF
      return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    case 'image/png':
      // 89 50 4E 47 0D 0A 1A 0A
      return (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47
      );
    case 'model/gltf-binary':
      // glTF (0x46546C67)
      return buffer.slice(0, 4).toString('ascii') === 'glTF';
    default:
      return true;
  }
}

// ── Multer storage: keep files in memory for validation, then hand off ─────────

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(
      Object.assign(new Error(`File type "${file.mimetype}" is not permitted.`), { code: 'INVALID_MIME_TYPE' }),
      false
    );
  }

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return cb(
      Object.assign(new Error(`File extension "${ext}" is not permitted.`), { code: 'INVALID_EXTENSION' }),
      false
    );
  }

  cb(null, true);
}

const maxFileSizeBytes = parseInt(process.env.MAX_FILE_SIZE_MB || '50', 10) * 1024 * 1024;

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxFileSizeBytes },
});

// ── Post-upload magic-byte validation middleware ───────────────────────────────

/**
 * Run AFTER multer has buffered the file.
 * Verifies magic bytes for critical MIME types.
 */
function validateMagicBytes(req, res, next) {
  const file = req.file || (req.files && req.files[0]);
  if (!file) return next();

  if (!checkMagicBytes(file.buffer, file.mimetype)) {
    return res.status(400).json({
      error: 'File content does not match its declared type. Upload rejected.',
      code: 'MAGIC_BYTE_MISMATCH',
    });
  }
  next();
}

/**
 * Error handler for multer errors — call as an Express error middleware.
 */
function handleUploadError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: `File exceeds maximum allowed size of ${process.env.MAX_FILE_SIZE_MB || 50} MB.`,
        code: 'FILE_TOO_LARGE',
      });
    }
    return res.status(400).json({ error: err.message, code: err.code });
  }
  if (err && (err.code === 'INVALID_MIME_TYPE' || err.code === 'INVALID_EXTENSION')) {
    return res.status(400).json({ error: err.message, code: err.code });
  }
  next(err);
}

module.exports = { upload, validateMagicBytes, handleUploadError };
