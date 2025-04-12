const Task = require('../models/Task');
const Checklist = require('../models/Checklist');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

/**
 * @desc    Get all tasks for a checklist
 * @route   GET /api/checklists/:checklistId/tasks
 * @access  Private
 */
exports.getTasks = asyncHandler(async (req, res, next) => {
  // Check if checklist exists and belongs to user
  const checklist = await Checklist.findOne({
    _id: req.params.checklistId,
    user: req.user.id
  });

  if (!checklist) {
    return next(
      new ErrorResponse(`Checklist not found with id of ${req.params.checklistId}`, 404)
    );
  }

  const tasks = await Task.find({ checklist: req.params.checklistId }).sort('position');

  res.status(200).json({
    success: true,
    count: tasks.length,
    data: tasks
  });
});

/**
 * @desc    Create new task
 * @route   POST /api/checklists/:checklistId/tasks
 * @access  Private
 */
exports.createTask = asyncHandler(async (req, res, next) => {
  // Check if checklist exists and belongs to user
  const checklist = await Checklist.findOne({
    _id: req.params.checklistId,
    user: req.user.id
  });

  if (!checklist) {
    return next(
      new ErrorResponse(`Checklist not found with id of ${req.params.checklistId}`, 404)
    );
  }

  // Set checklist and user in request body
  req.body.checklist = req.params.checklistId;
  req.body.user = req.user.id;

  // Get the current highest position
  const lastTask = await Task.findOne({ checklist: req.params.checklistId })
    .sort('-position')
    .select('position');

  // Set position for new task
  req.body.position = lastTask ? lastTask.position + 1 : 0;

  const task = await Task.create(req.body);

  res.status(201).json({
    success: true,
    data: task
  });
});

/**
 * @desc    Update task
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
exports.updateTask = asyncHandler(async (req, res, next) => {
  let task = await Task.findById(req.params.id);

  if (!task) {
    return next(
      new ErrorResponse(`Task not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure task belongs to user
  if (task.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`User not authorized to update this task`, 401)
    );
  }

  task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: task
  });
});

/**
 * @desc    Reorder tasks
 * @route   PUT /api/tasks/:checklistId/reorder
 * @access  Private
 */
exports.reorderTasks = asyncHandler(async (req, res, next) => {
  const { tasks } = req.body;

  // Validate checklist ownership
  const checklist = await Checklist.findOne({
    _id: req.params.checklistId,
    user: req.user.id
  });

  if (!checklist) {
    return next(
      new ErrorResponse(`Checklist not found with id of ${req.params.checklistId}`, 404)
    );
  }

  // Update all tasks in single transaction
  const bulkOps = tasks.map(task => ({
    updateOne: {
      filter: { _id: task._id, checklist: req.params.checklistId },
      update: { $set: { position: task.position } }
    }
  }));

  await Task.bulkWrite(bulkOps);

  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Delete task
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
exports.deleteTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return next(
      new ErrorResponse(`Task not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure task belongs to user
  if (task.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`User not authorized to delete this task`, 401)
    );
  }

  await task.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Toggle task completion status
 * @route   PUT /api/tasks/:id/toggle
 * @access  Private
 */
exports.toggleTaskCompletion = asyncHandler(async (req, res, next) => {
  let task = await Task.findById(req.params.id);

  if (!task) {
    return next(
      new ErrorResponse(`Task not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure task belongs to user
  if (task.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`User not authorized to update this task`, 401)
    );
  }

  task.completed = !task.completed;
  task.completedAt = task.completed ? Date.now() : null;
  await task.save();

  res.status(200).json({
    success: true,
    data: task
  });
});