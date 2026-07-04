import express from 'express';
import { getWeeklyReview, getCourseSpending, getPopularCourses, categorizeBills } from '../controllers/aiController.js';

const router = express.Router();

router.get('/weekly-review', getWeeklyReview);
router.get('/course-spending', getCourseSpending);
router.get('/popular-courses', getPopularCourses);
router.get('/categorize-bills', categorizeBills);

export default router;
