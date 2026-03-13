import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "name is required"],
        minlength: [3, "name must be at least 3 characters"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            "Please enter a valid email address"
        ]
    }, // password was inside here previously
    role: {
        type: String,
        enum: ['student', 'teacher', 'admin'],
        default: 'student',
    },
    rollNo: {
        type: String,
        trim: true,
        sparse: true // Allows unique null values if needed, though email is the primary unique field
    },
    department: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    password: {
        type: String,
        required: [true, "password is required"],
        minlength: [6, "minimum 6 characters required"],
        validate: {
            validator: function (value) {
                // Requires uppercase, lowercase, number, and special character
                // Allows any character (including special ones) as long as it satisfies the conditions
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/.test(value);
            },
            message: "Password must contain uppercase, lowercase, number, and special character"
        }
    },
    confirmPassword: {
        type: String,
        required: [true, "confirm password is required"],
        validate: { // Changed from 'validation' to 'validate'
            validator: function (value) {
                // 'this' refers to the document ONLY on create. 
                // It will not work on updates unless context is set.
                return value === this.password;
            },
            message: "passwords do not match"
        }
    }
});


// Hash password before saving
// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        this.confirmPassword = undefined; // Do not save confirmPassword
    } catch (error) {
        throw new Error(error);
    }
});

const dataModel = mongoose.model("userData", userSchema);

export default dataModel;