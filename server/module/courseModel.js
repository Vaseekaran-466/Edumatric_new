import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Course title is required'],
            trim: true,
            minlength: [3, 'Title must be at least 3 characters'],
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
        },
        instructor: {
            type: String,
            required: [true, 'Instructor name is required'],
            trim: true,
        },
        // References to User documents enrolled in this course
        students: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'userData',
            },
        ],
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }  // Adds createdAt and updatedAt automatically
);

const Course = mongoose.model('Course', courseSchema);
export default Course;
