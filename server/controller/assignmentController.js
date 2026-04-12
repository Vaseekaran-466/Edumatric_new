import Assignment from '../module/assignmentModel.js';
import Course from '../module/courseModel.js';

// ─── Create Assignment ────────────────────────────────────────────────────────
export const createAssignment = async (req, res) => {
    try {
        const { title, description, type, courseId, dueDate, points, materialLink, materialName } = req.body;
        if (!title || !courseId || !dueDate) {
            return res.status(400).json({ message: 'title, courseId, and dueDate are required' });
        }
        const assignment = await Assignment.create({
            title, description, type, courseId, dueDate, points,
            materialLink, materialName,
            createdBy: req.user.id,  // Set from JWT via authMiddleware
        });
        res.status(201).json({ message: 'Assignment created', assignment });
    } catch (error) {
        console.error('createAssignment:', error);
        res.status(500).json({ message: 'Failed to create assignment', error: error.message });
    }
};

// ─── Get Assignments by Course ────────────────────────────────────────────────
export const getAssignmentsByCourse = async (req, res) => {
    try {
        const assignments = await Assignment.find({ courseId: req.params.courseId })
            .populate('createdBy', 'name email')
            .sort({ dueDate: 1 })
            .lean();
        res.status(200).json({ assignments });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch assignments', error: error.message });
    }
};

// ─── Get All Assignments ──────────────────────────────────────────────────────
export const getAllAssignments = async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'student') {
            const enrolledCourses = await Course.find({ students: req.user.id }).select('_id').lean();
            const courseIds = enrolledCourses.map(c => c._id);
            query = { courseId: { $in: courseIds } };
        } else if (req.user.role === 'teacher') {
            query = { createdBy: req.user.id };
        }

        const assignments = await Assignment.find(query)
            .populate('courseId', 'title')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 })
            .lean();
        res.status(200).json({ assignments });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch assignments', error: error.message });
    }
};

// ─── Update Assignment ────────────────────────────────────────────────────────
export const updateAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
        res.status(200).json({ message: 'Assignment updated', assignment });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update assignment', error: error.message });
    }
};

// ─── Delete Assignment ────────────────────────────────────────────────────────
export const deleteAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findByIdAndDelete(req.params.id);
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
        res.status(200).json({ message: 'Assignment deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete assignment', error: error.message });
    }
};
