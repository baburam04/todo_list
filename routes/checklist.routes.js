const express = require('express');
const {
  getChecklists,
  getChecklist,
  createChecklist,
  updateChecklist,
  deleteChecklist
} = require('../controllers/checklist.controller');
const { protect, checkOwnership } = require('../middleware/auth');
const Checklist = require('../models/Checklist');

// Include task routes
const taskRouter = require('./task.routes');

const router = express.Router();

// Re-route into task router
router.use('/:checklistId/tasks', taskRouter);

router
  .route('/')
  .get(protect, getChecklists)
  .post(protect, createChecklist);

router
  .route('/:id')
  .get(protect, checkOwnership(Checklist), getChecklist)
  .put(protect, checkOwnership(Checklist), updateChecklist)
  .delete(protect, checkOwnership(Checklist), deleteChecklist);

module.exports = router;