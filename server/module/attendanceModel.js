import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
    {
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        // Array of per-student attendance records for this date
        records: [
            {
                studentId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'userData',
                    required: true,
                },
                status: {
                    type: String,
                    enum: ['present', 'absent', 'late'],
                    default: 'absent',
                },
            },
        ],
        // Teacher who marked attendance
        markedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'userData',
        },
    },
    { timestamps: true }
);

// One attendance record per course per day
attendanceSchema.index({ courseId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
