const express = require('express');
const router = express.Router();
const modelController = require('../controllers/modelController');

router.get('/', modelController.getAllModels);
router.get('/:id', modelController.getModelById);

module.exports = router;