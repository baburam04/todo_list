const express = require('express');
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
  reorderTasks
} = require('../controllers/task.controller');
const { protect } = require('../config/jwt');

const router = express.Router({ mergeParams: true });

router.route('/')
  .get(protect, getTasks)
  .post(protect, createTask);

router.route('/:id')
  .put(protect, updateTask)
  .delete(protect, deleteTask);

router.put('/:id/toggle', protect, toggleTaskCompletion);
router.put('/reorder', protect, reorderTasks);

module.exports = router;