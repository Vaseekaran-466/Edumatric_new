import Submission from '../module/submissionModel.js';

// ─── Submit Assignment ────────────────────────────────────────────────────────
// studentId always comes from the JWT, NOT the request body — prevents IDOR
export const submitAssignment = async (req, res) => {
    try {
        const { assignmentId, text, fileUrl, fileName, link } = req.body;
        if (!assignmentId) {
            return res.status(400).json({ message: 'assignmentId is required' });
        }

        // Upsert: if student re-submits, update the existing submission
        const submission = await Submission.findOneAndUpdate(
            { assignmentId, studentId: req.user.id },
            { text, fileUrl, fileName, link, status: 'submitted', marks: null },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.status(201).json({ message: 'Submission saved', submission });
    } catch (error) {
        console.error('submitAssignment:', error);
        res.status(500).json({ message: 'Failed to submit', error: error.message });
    }
};

// ─── Get My Submissions (Student) ────────────────────────────────────────────
export const getMySubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({ studentId: req.user.id })
            .populate('assignmentId', 'title dueDate points type');
        res.status(200).json({ submissions });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch submissions', error: error.message });
    }
};

// ─── Get Submissions for an Assignment (Teacher/Admin) ───────────────────────
export const getSubmissionsByAssignment = async (req, res) => {
    try {
        const submissions = await Submission.find({ assignmentId: req.params.assignmentId })
            .populate('studentId', 'name email')
            .sort({ createdAt: -1 });
        res.status(200).json({ submissions });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch submissions', error: error.message });
    }
};

// ─── Get All Submissions (Generic with Role check) ────────────────────────
export const getAllSubmissions = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'student') {
            query = { studentId: req.user.id };
        }
        const submissions = await Submission.find(query)
            .populate('assignmentId', 'title dueDate points type')
            .populate('studentId', 'name email')
            .sort({ createdAt: -1 });
        res.status(200).json({ submissions });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch submissions', error: error.message });
    }
};

// ─── Grade Submission (Teacher/Admin) ────────────────────────────────────────
export const gradeSubmission = async (req, res) => {
    try {
        const { marks, feedback } = req.body;
        if (marks === undefined || marks === null) {
            return res.status(400).json({ message: 'marks is required for grading' });
        }
        const submission = await Submission.findByIdAndUpdate(
            req.params.id,
            { marks, feedback, status: 'graded' },
            { new: true }
        );
        if (!submission) return res.status(404).json({ message: 'Submission not found' });
        res.status(200).json({ message: 'Submission graded', submission });
    } catch (error) {
        res.status(500).json({ message: 'Failed to grade submission', error: error.message });
    }
};
