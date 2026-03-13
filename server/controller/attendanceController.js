import Attendance from '../module/attendanceModel.js';

// ─── Mark Attendance (Teacher) ────────────────────────────────────────────────
// records = [{ studentId, status }]
export const markAttendance = async (req, res) => {
    try {
        const { courseId, date, records } = req.body;
        if (!courseId || !date || !records || !Array.isArray(records)) {
            return res.status(400).json({ message: 'courseId, date, and records[] are required' });
        }

        // Upsert — only one record per course per day (enforced by unique index)
        const attendance = await Attendance.findOneAndUpdate(
            { courseId, date: new Date(date) },
            { records, markedBy: req.user.id },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.status(200).json({ message: 'Attendance saved', attendance });
    } catch (error) {
        console.error('markAttendance:', error);
        res.status(500).json({ message: 'Failed to mark attendance', error: error.message });
    }
};

// ─── Get Attendance for a Course ─────────────────────────────────────────────
export const getAttendanceByCourse = async (req, res) => {
    try {
        const attendance = await Attendance.find({ courseId: req.params.courseId })
            .populate('records.studentId', 'name email')
            .sort({ date: -1 });
        res.status(200).json({ attendance });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch attendance', error: error.message });
    }
};

// ─── Get Student's Attendance (My Attendance) ────────────────────────────────
export const getMyAttendance = async (req, res) => {
    try {
        const allRecords = await Attendance.find({
            'records.studentId': req.user.id,
        })
            .populate('courseId', 'title')
            .select('courseId date records');

        // Filter to only this student's record per date
        const myAttendance = allRecords.map((a) => ({
            courseId: a.courseId?._id || a.courseId,
            courseTitle: a.courseId?.title || 'Unknown Course',
            date: a.date,
            status: a.records.find(
                (r) => r.studentId.toString() === req.user.id
            )?.status,
        }));

        res.status(200).json({ myAttendance });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch attendance', error: error.message });
    }
};
