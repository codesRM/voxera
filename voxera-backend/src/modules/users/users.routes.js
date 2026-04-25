const express          = require('express');
const router           = express.Router();
const multer           = require('multer');
const path             = require('path');
const { authenticate, optionalAuthenticate } = require('../../middlewares/auth');
const usersController  = require('./users.controller');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext  = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Images only (jpeg, jpg, png, gif, webp)'));
  },
});

router.get('/search',          authenticate, usersController.searchUsers);
router.get('/:username',       optionalAuthenticate, usersController.getUserProfile);
router.get('/:username/posts', usersController.getUserPosts);
router.patch('/profile',       authenticate, usersController.updateProfile);
router.post('/avatar',         authenticate, upload.single('avatar'), usersController.uploadAvatar);

module.exports = router;
