const Checklist = require('../models/Checklist');
const Task = require('../models/Task');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all checklists for logged in user
// @route   GET /api/checklists
// @access  Private
exports.getChecklists = asyncHandler(async (req, res, next) => {
  // Advanced filtering, sorting, pagination would go here
  const checklists = await Checklist.find({ user: req.user.id })
    .sort('-createdAt')
    .populate({
      path: 'tasks',
      select: 'title completed position'
    });

  res.status(200).json({
    success: true,
    count: checklists.length,
    data: checklists
  });
});

// @desc    Get single checklist
// @route   GET /api/checklists/:id
// @access  Private
exports.getChecklist = asyncHandler(async (req, res, next) => {
  const checklist = await Checklist.findById(req.params.id)
    .populate({
      path: 'tasks',
      select: 'title completed position',
      options: { sort: { position: 1 } }
    });

  if (!checklist) {
    return next(
      new ErrorResponse(`Checklist not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: checklist
  });
});

// @desc    Create new checklist
// @route   POST /api/checklists
// @access  Private
exports.createChecklist = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  const checklist = await Checklist.create(req.body);

  res.status(201).json({
    success: true,
    data: checklist
  });
});

// @desc    Update checklist
// @route   PUT /api/checklists/:id
// @access  Private
exports.updateChecklist = asyncHandler(async (req, res, next) => {
  let checklist = await Checklist.findById(req.params.id);

  if (!checklist) {
    return next(
      new ErrorResponse(`Checklist not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is checklist owner
  if (checklist.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`User not authorized to update this checklist`, 401)
    );
  }

  checklist = await Checklist.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: checklist
  });
});

// @desc    Delete checklist and its tasks
// @route   DELETE /api/checklists/:id
// @access  Private
exports.deleteChecklist = asyncHandler(async (req, res, next) => {
  const checklist = await Checklist.findById(req.params.id);

  if (!checklist) {
    return next(
      new ErrorResponse(`Checklist not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is checklist owner
  if (checklist.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`User not authorized to delete this checklist`, 401)
    );
  }

  // Delete all associated tasks first
  await Task.deleteMany({ checklist: req.params.id });

  await checklist.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});