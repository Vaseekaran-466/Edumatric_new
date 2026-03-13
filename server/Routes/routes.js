import express from 'express';

// Auth controllers
import {
    register, login, getUser, getAllUsers, updateUser, deleteUser, logout,
    getStats, updateMe, createUser
} from '../controller/controller.js';

// Data controllers
import { createCourse, getAllCourses, getCourseById, updateCourse, deleteCourse, enrollStudent, unenrollStudent } from '../controller/courseController.js';
import { createAssignment, getAssignmentsByCourse, getAllAssignments, updateAssignment, deleteAssignment } from '../controller/assignmentController.js';
import { submitAssignment, getMySubmissions, getSubmissionsByAssignment, gradeSubmission, getAllSubmissions } from '../controller/submissionController.js';
import { markAttendance, getAttendanceByCourse, getMyAttendance } from '../controller/attendanceController.js';
import { addMaterial, getAllMaterials, getMaterialsByCourse, updateMaterial, deleteMaterial } from '../controller/materialController.js';

// Middleware
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// AUTH ROUTES (public)
// POST /api/datasedu/register
// POST /api/datasedu/login
// POST /api/datasedu/logout
// GET  /api/datasedu/me
// ─────────────────────────────────────────────────────────────────────────────
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Soft auth for /me: if no cookie, returns 200 with { user: null } instead of 401 error
router.get('/me', authMiddleware({ isOptional: true }), getUser);
router.patch('/me', authMiddleware(), updateMe);
router.get('/stats', authMiddleware(), roleMiddleware('admin', 'teacher'), getStats);
router.get('/users', authMiddleware(), roleMiddleware('admin', 'teacher'), getAllUsers);
router.post('/users', authMiddleware(), roleMiddleware('admin', 'teacher'), createUser);
router.put('/users/:id', authMiddleware(), roleMiddleware('admin', 'teacher'), updateUser);
router.delete('/users/:id', authMiddleware(), roleMiddleware('admin', 'teacher'), deleteUser);

// ─────────────────────────────────────────────────────────────────────────────
// COURSE ROUTES (all protected)
// GET    /api/datasedu/courses
// POST   /api/datasedu/courses
// GET    /api/datasedu/courses/:id
// PUT    /api/datasedu/courses/:id
// DELETE /api/datasedu/courses/:id
// POST   /api/datasedu/courses/:id/enroll
// POST   /api/datasedu/courses/:id/unenroll
// ─────────────────────────────────────────────────────────────────────────────
router.get('/courses', authMiddleware(), getAllCourses);
router.post('/courses', authMiddleware(), roleMiddleware('admin', 'teacher'), createCourse);
router.get('/courses/:id', authMiddleware(), getCourseById);
router.put('/courses/:id', authMiddleware(), roleMiddleware('admin', 'teacher'), updateCourse);
router.delete('/courses/:id', authMiddleware(), roleMiddleware('admin', 'teacher'), deleteCourse);
router.post('/courses/:id/enroll', authMiddleware(), roleMiddleware('admin', 'teacher'), enrollStudent);
router.post('/courses/:id/unenroll', authMiddleware(), roleMiddleware('admin', 'teacher'), unenrollStudent);

// ─────────────────────────────────────────────────────────────────────────────
// ASSIGNMENT ROUTES (all protected)
// GET    /api/datasedu/assignments
// POST   /api/datasedu/assignments
// GET    /api/datasedu/assignments/course/:courseId
// PUT    /api/datasedu/assignments/:id
// DELETE /api/datasedu/assignments/:id
// ─────────────────────────────────────────────────────────────────────────────
router.get('/assignments', authMiddleware(), getAllAssignments);
router.post('/assignments', authMiddleware(), roleMiddleware('admin', 'teacher'), createAssignment);
router.get('/assignments/course/:courseId', authMiddleware(), getAssignmentsByCourse);
router.put('/assignments/:id', authMiddleware(), roleMiddleware('admin', 'teacher'), updateAssignment);
router.delete('/assignments/:id', authMiddleware(), roleMiddleware('admin', 'teacher'), deleteAssignment);

// ─────────────────────────────────────────────────────────────────────────────
// SUBMISSION ROUTES (all protected)
// POST  /api/datasedu/submissions          — student submits
// GET   /api/datasedu/submissions/mine     — student sees their own
// GET   /api/datasedu/submissions/assignment/:assignmentId — teacher views
// PATCH /api/datasedu/submissions/:id/grade — teacher grades
// ─────────────────────────────────────────────────────────────────────────────
router.post('/submissions', authMiddleware(), submitAssignment);
router.get('/submissions', authMiddleware(), getAllSubmissions);
router.get('/submissions/mine', authMiddleware(), getMySubmissions);
router.get('/submissions/assignment/:assignmentId', authMiddleware(), roleMiddleware('admin', 'teacher'), getSubmissionsByAssignment);
router.patch('/submissions/:id/grade', authMiddleware(), roleMiddleware('admin', 'teacher'), gradeSubmission);

// ─────────────────────────────────────────────────────────────────────────────
// ATTENDANCE ROUTES (all protected)
// POST /api/datasedu/attendance             — teacher marks
// GET  /api/datasedu/attendance/:courseId   — get by course
// GET  /api/datasedu/attendance/mine        — student views personal
// ─────────────────────────────────────────────────────────────────────────────
router.post('/attendance', authMiddleware(), roleMiddleware('admin', 'teacher'), markAttendance);
router.get('/attendance/mine', authMiddleware(), getMyAttendance);
router.get('/attendance/:courseId', authMiddleware(), roleMiddleware('admin', 'teacher'), getAttendanceByCourse);

// ─────────────────────────────────────────────────────────────────────────────
// MATERIAL ROUTES (all protected)
// POST   /api/datasedu/materials
// GET    /api/datasedu/materials/course/:courseId
// PUT    /api/datasedu/materials/:id
// DELETE /api/datasedu/materials/:id
// ─────────────────────────────────────────────────────────────────────────────
router.get('/materials', authMiddleware(), getAllMaterials);
router.post('/materials', authMiddleware(), roleMiddleware('admin', 'teacher'), addMaterial);
router.get('/materials/course/:courseId', authMiddleware(), getMaterialsByCourse);
router.put('/materials/:id', authMiddleware(), roleMiddleware('admin', 'teacher'), updateMaterial);
router.delete('/materials/:id', authMiddleware(), roleMiddleware('admin', 'teacher'), deleteMaterial);

export default router;