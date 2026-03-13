import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Material title is required'],
            trim: true,
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },
        type: {
            type: String,
            enum: ['video', 'document', 'link', 'other'],
            default: 'document',
        },
        // URL to the resource (Cloudinary, S3, YouTube, etc.) — never store binary in MongoDB
        url: {
            type: String,
            required: [true, 'Material URL is required'],
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'userData',
        },
    },
    { timestamps: true }
);

const Material = mongoose.model('Material', materialSchema);
export default Material;
