const express = require('express');
const {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} = require('../controllers/serviceController');
const { protect, admin } = require('../middleware/authMiddleware');
const { uploadServiceImage } = require('../config/multer');

const router = express.Router();

router.get('/', getServices);
router.get('/:id', getServiceById);
router.post('/', protect, admin, uploadServiceImage.single('image'), createService);
router.put('/:id', protect, admin, uploadServiceImage.single('image'), updateService);
router.delete('/:id', protect, admin, deleteService);

module.exports = router;
