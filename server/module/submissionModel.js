import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
    {
        // Relation
        assignmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Assignment',
            required: true,
        },
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'userData',
            required: true,
        },
        // Submission content
        text: {
            type: String,
            trim: true,
            default: '',
        },
        // File is stored externally (Cloudinary/S3). Only the URL is persisted here.
        fileUrl: {
            type: String,
            default: '',
        },
        fileName: {
            type: String,
            default: '',
        },
        link: {
            type: String,
            default: '',
        },
        // Grading
        status: {
            type: String,
            enum: ['submitted', 'graded'],
            default: 'submitted',
        },
        marks: {
            type: Number,
            default: null,
        },
        feedback: {
            type: String,
            default: '',
        },
    },
    { timestamps: true }
);

// Prevent duplicate submissions from same student for same assignment
submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;
