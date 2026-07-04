import express from 'express';
import { admitStudent, getStudents, getStudentDetails, deleteStudent } from '../controllers/studentController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getStudents);
router.get('/:id', protect, getStudentDetails);
router.post('/admit', protect, admitStudent);
router.delete('/:id', protect, adminOnly, deleteStudent);

export default router;
