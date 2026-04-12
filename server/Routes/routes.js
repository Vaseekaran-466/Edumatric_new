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
import requireDbConnection from '../middleware/requireDbConnection.js';

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// AUTH ROUTES (public)
// POST /api/datasedu/register
// POST /api/datasedu/login
// POST /api/datasedu/logout
// GET  /api/datasedu/me
// ─────────────────────────────────────────────────────────────────────────────
router.post('/register', requireDbConnection, register);
router.post('/login', requireDbConnection, login);
router.post('/logout', logout);

// Soft auth for /me: if no cookie, returns 200 with { user: null } instead of 401 error
router.get('/me', authMiddleware({ isOptional: true }), requireDbConnection, getUser);
router.patch('/me', authMiddleware(), requireDbConnection, updateMe);
router.get('/stats', authMiddleware(), requireDbConnection, roleMiddleware('admin', 'teacher'), getStats);
router.get('/users', authMiddleware(), requireDbConnection, roleMiddleware('admin', 'teacher'), getAllUsers);
router.post('/users', authMiddleware(), requireDbConnection, roleMiddleware('admin', 'teacher'), createUser);
router.put('/users/:id', authMiddleware(), requireDbConnection, roleMiddleware('admin', 'teacher'), updateUser);
router.delete('/users/:id', authMiddleware(), requireDbConnection, roleMiddleware('admin', 'teacher'), deleteUser);

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
router.get('/courses', authMiddleware(), requireDbConnection, getAllCourses);
router.post('/courses', authMiddleware(), requireDbConnection, roleMiddleware('admin', 'teacher'), createCourse);
router.get('/courses/:id', authMiddleware(), requireDbConnection, getCourseById);
router.put('/courses/:id', authMiddleware(), requireDbConnection, roleMiddleware('admin', 'teacher'), updateCourse);
router.delete('/courses/:id', authMiddleware(), requireDbConnection, roleMiddleware('admin', 'teacher'), deleteCourse);
router.post('/courses/:id/enroll', authMiddleware(), requireDbConnection, roleMiddleware('admin', 'teacher'), enrollStudent);
router.post('/courses/:id/unenroll', authMiddleware(), requireDbConnection, roleMiddleware('admin', 'teacher'), unenrollStudent);

// ─────────────────────────────────────────────────────────────────────────────
// ASSIGNMENT ROUTES (all protected)
// GET    /api/datasedu/assignments
// POST   /api/datasedu/assignments
// GET    /api/datasedu/assignments/course/:courseId
// PUT    /api/datasedu/assignments/:id
// DELETE /api/datasedu/assignments/:id
// ─────────────────────────────────────────────────────────────────────────────
router.get('/assignments', authMiddleware(), requireDbConnection, getAllAssignments);
router.post('/assignments', authMiddleware(), requireDbConnection, roleMiddleware('admin', 'teacher'), createAssignment);
router.get('/assignments/course/:courseId', authMiddleware(), requireDbConnection, getAssignmentsByCourse);
router.put('/assignments/:id', authMiddleware(), requireDbConnection, roleMiddleware('admin', 'teacher'), updateAssignment);
router.delete('/assignments/:id', authMiddleware(), requireDbConnection, roleMiddleware('admin', 'teacher'), deleteAssignment);

// ─────────────────────────────────────────────────────────────────────────────
// SUBMISSION ROUTES (all protected)
// POST  /api/datasedu/submissions          — student submits
// GET   /api/datasedu/submissions/mine     — student sees their own
// GET   /api/datasedu/submissions/assignment/:assignmentId — teacher views
// PATCH /api/datasedu/submissions/:id/grade — teacher grades
// ─────────────────────────────────────────────────────────────────────────────
router.post('/submissions', authMiddleware(), requireDbConnection, submitAssignment);
router.get('/submissions', authMiddleware(), requireDbConnection, getAllSubmissions);
router.get('/submissions/mine', authMiddleware(), requireDbConnection, getMySubmissions);
router.get('/submissions/assignment/:assignmentId', authMiddleware(), requireDbConnection, roleMiddleware('admin', 'teacher'), getSubmissionsByAssignment);
router.patch('/submissions/:id/grade', authMiddleware(), requireDbConnection, roleMiddleware('admin', 'teacher'), gradeSubmission);

// ─────────────────────────────────────────────────────────────────────────────
// ATTENDANCE ROUTES (all protected)
// POST /api/datasedu/attendance             — teacher marks
// GET  /api/datasedu/attendance/:courseId   — get by course
// GET  /api/datasedu/attendance/mine        — student views personal
// ─────────────────────────────────────────────────────────────────────────────
router.post('/attendance', authMiddleware(), requireDbConnection, roleMiddleware('admin', 'teacher'), markAttendance);
router.get('/attendance/mine', authMiddleware(), requireDbConnection, getMyAttendance);
router.get('/attendance/:courseId', authMiddleware(), requireDbConnection, roleMiddleware('admin', 'teacher'), getAttendanceByCourse);

// ─────────────────────────────────────────────────────────────────────────────
// MATERIAL ROUTES (all protected)
// POST   /api/datasedu/materials
// GET    /api/datasedu/materials/course/:courseId
// PUT    /api/datasedu/materials/:id
// DELETE /api/datasedu/materials/:id
// ─────────────────────────────────────────────────────────────────────────────
router.get('/materials', authMiddleware(), requireDbConnection, getAllMaterials);
router.post('/materials', authMiddleware(), requireDbConnection, roleMiddleware('admin', 'teacher'), addMaterial);
router.get('/materials/course/:courseId', authMiddleware(), requireDbConnection, getMaterialsByCourse);
router.put('/materials/:id', authMiddleware(), requireDbConnection, roleMiddleware('admin', 'teacher'), updateMaterial);
router.delete('/materials/:id', authMiddleware(), requireDbConnection, roleMiddleware('admin', 'teacher'), deleteMaterial);

export default router;
