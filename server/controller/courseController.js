import Course from '../module/courseModel.js';
import dataModel from '../module/model.js';

// ─── Create Course (Admin/Teacher) ──────────────────────────────────────────
export const createCourse = async (req, res) => {
    try {
        const { title, description, instructor } = req.body;
        if (!title || !description || !instructor) {
            return res.status(400).json({ message: 'title, description, and instructor are required' });
        }
        const course = await Course.create({ title, description, instructor, students: [] });
        res.status(201).json({ message: 'Course created', course });
    } catch (error) {
        console.error('createCourse:', error);
        res.status(500).json({ message: 'Failed to create course', error: error.message });
    }
};

// ─── Get All Courses ─────────────────────────────────────────────────────────
export const getAllCourses = async (req, res) => {
    try {
        const query = { isActive: true };

        if (req.user.role === 'student') {
            query.students = req.user.id;
        }

        let courseQuery = Course.find(query).sort({ createdAt: -1 });

        if (req.user.role !== 'student') {
            courseQuery = courseQuery.populate('students', '_id name email');
        }

        const courses = await courseQuery.lean();
        res.status(200).json({ courses });
    } catch (error) {
        console.error('getAllCourses:', error);
        res.status(500).json({ message: 'Failed to fetch courses', error: error.message });
    }
};

// ─── Get Single Course ────────────────────────────────────────────────────────
export const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('students', '_id name email')
            .lean();
        if (!course) return res.status(404).json({ message: 'Course not found' });

        // Access control: Ensure student is enrolled in the course if they are a student role.
        if (req.user && req.user.role === 'student') {
            const isEnrolled = course.students.some(student => student._id.toString() === req.user.id.toString());
            if (!isEnrolled) {
                return res.status(403).json({ message: 'Forbidden: You do not have access to this course' });
            }
        }

        res.status(200).json({ course });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch course', error: error.message });
    }
};

// ─── Update Course ────────────────────────────────────────────────────────────
export const updateCourse = async (req, res) => {
    try {
        const { title, description, instructor, isActive } = req.body;
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            { title, description, instructor, isActive },
            { new: true, runValidators: true }
        );
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.status(200).json({ message: 'Course updated', course });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update course', error: error.message });
    }
};

// ─── Delete Course (soft delete) ─────────────────────────────────────────────
export const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.status(200).json({ message: 'Course deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete course', error: error.message });
    }
};

// ─── Enroll Student in Course ─────────────────────────────────────────────────
export const enrollStudent = async (req, res) => {
    try {
        const { studentId } = req.body;
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const student = await dataModel.findById(studentId);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        if (course.students.includes(studentId)) {
            return res.status(409).json({ message: 'Student already enrolled' });
        }

        course.students.push(studentId);
        await course.save();
        res.status(200).json({ message: 'Student enrolled successfully', course });
    } catch (error) {
        res.status(500).json({ message: 'Failed to enroll student', error: error.message });
    }
};

// ─── Unenroll Student from Course ────────────────────────────────────────────
export const unenrollStudent = async (req, res) => {
    try {
        const { studentId } = req.body;
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            { $pull: { students: studentId } },
            { new: true }
        );
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.status(200).json({ message: 'Student unenrolled', course });
    } catch (error) {
        res.status(500).json({ message: 'Failed to unenroll student', error: error.message });
    }
};
