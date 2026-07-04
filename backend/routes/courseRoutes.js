import express from 'express';
import { getCourses, createCourse, deleteCourse } from '../controllers/courseController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getCourses);
router.post('/', protect, adminOnly, createCourse);
router.delete('/:id', protect, adminOnly, deleteCourse);

export default router;
