const express = require('express');
const multer = require('multer');
const upoload = require('../middleware/upload');
const detectionController = require('../controller/detectionController');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

console.log('Controller Function: ', detectionController.processDetection);

router.post('/detect', upload.single('image'), detectionController.processDetection);

router.post('/exportExcel',upload.none(), detectionController.exportDetectionHistory);

module.exports = router;