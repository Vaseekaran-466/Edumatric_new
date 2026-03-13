import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Assignment title is required'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
        type: {
            type: String,
            enum: ['assignment', 'quiz'],
            default: 'assignment',
        },
        // Reference to Course
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: [true, 'Course reference is required'],
        },
        dueDate: {
            type: Date,
            required: [true, 'Due date is required'],
        },
        points: {
            type: Number,
            default: 100,
            min: [0, 'Points cannot be negative'],
        },
        // Optional material references (stored URL from Cloudinary/S3, not binary)
        materialLink: {
            type: String,
            default: '',
        },
        materialName: {
            type: String,
            default: '',
        },
        // Creator (teacher) reference
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'userData',
            required: true,
        },
    },
    { timestamps: true }
);

const Assignment = mongoose.model('Assignment', assignmentSchema);
export default Assignment;
