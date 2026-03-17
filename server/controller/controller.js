import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dataModel from '../module/model.js';
import Course from '../module/courseModel.js';
import Assignment from '../module/assignmentModel.js';
import Material from '../module/materialModel.js';

/**
 * Generates a JWT and sets it as an HttpOnly, Secure cookie.
 * HttpOnly: JS cannot access the token — blocks XSS.
 * Secure: Only sent over HTTPS (in production).
 * SameSite=Strict: Blocks CSRF by default.
 */
const sendToken = (res, user) => {
    if (!process.env.JWT_SECRET) {
        console.error('CRITICAL: JWT_SECRET is not defined. Cannot sign token.');
        throw new Error('Internal Server Configuration Error');
    }

    const payload = { id: user._id, email: user.email, role: user.role };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    // Determine if we're running in a production-like cross-domain setup
    const isProduction = process.env.NODE_ENV === 'production' || 
                         (process.env.CLIENT_URL && !process.env.CLIENT_URL.includes('localhost'));

    res.cookie('token', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax', // 'none' is required for cross-domain (Vercel to Render)
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    });
};

// ─── Register ────────────────────────────────────────────────────────────────
export const register = async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        const existingUser = await dataModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        const user = await dataModel.create({ name, email, password, confirmPassword });

        sendToken(res, user);

        res.status(201).json({
            message: 'User registered successfully',
            user: { _id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (error) {
        console.error('Register Error:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({ message: 'Validation failed', errors: messages });
        }
        res.status(500).json({ message: 'Server error during registration', error: error.message });
    }
};

// ─── Create User (Admin/Teacher) ─────────────────────────────────────────────
export const createUser = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, role, rollNo, department } = req.body;

        const existingUser = await dataModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        const user = await dataModel.create({ name, email, password, confirmPassword, role, rollNo, department });

        // Skip sendToken — we don't want the admin/teacher to be logged in as the new user

        res.status(201).json({
            message: 'User created successfully',
            user: { _id: user._id, name: user.name, email: user.email, role: user.role, rollNo: user.rollNo, department: user.department },
        });
    } catch (error) {
        console.error('Create User Error:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({ message: 'Validation failed', errors: messages });
        }
        res.status(500).json({ message: 'Server error creating user', error: error.message });
    }
};

// ─── Login ───────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Explicitly select password — it is excluded by default in the schema for security
        const user = await dataModel.findOne({ email }).select('+password');
        if (!user) {
            // Deliberately vague: do not expose whether email exists
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        sendToken(res, user);

        res.status(200).json({
            message: 'Login successful',
            user: { _id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (error) {
        console.error('LOGIN_CRASH_DETAILED:', {
            error: error.message,
            stack: error.stack,
            body: { ...req.body, password: '***' }
        });
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
};

// ─── Logout ──────────────────────────────────────────────────────────────────
export const logout = (req, res) => {
    const isProduction = process.env.NODE_ENV === 'production' || 
                         (process.env.CLIENT_URL && !process.env.CLIENT_URL.includes('localhost'));

    res.clearCookie('token', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

// ─── Get Current User ────────────────────────────────────────────────────────
export const getAllUsers = async (req, res) => {
    try {
        const users = await dataModel.find({}).select('-password -confirmPassword');
        res.status(200).json({ users });
    } catch (error) {
        console.error('GetAllUsers Error:', error);
        res.status(500).json({ message: 'Server error fetching users', error: error.message });
    }
};

export const getStats = async (req, res) => {
    try {
        const totalUsers = await dataModel.countDocuments();
        const totalCourses = await Course.countDocuments({ isActive: true });
        const totalAssignments = await Assignment.countDocuments();
        const totalMaterials = await Material.countDocuments();

        res.status(200).json({
            stats: { totalUsers, totalCourses, totalAssignments, totalMaterials },
        });
    } catch (error) {
        console.error('GetStats Error:', error);
        res.status(500).json({ message: 'Server error fetching stats', error: error.message });
    }
};

export const updateMe = async (req, res) => {
    try {
        const { name, email, department, rollNo, password, confirmPassword } = req.body;
        const user = await dataModel.findById(req.user.id).select('+password');

        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name) user.name = name;
        if (email) user.email = email;
        if (department) user.department = department;
        if (rollNo) user.rollNo = rollNo;

        if (password) {
            if (password !== confirmPassword) {
                return res.status(400).json({ message: 'Passwords do not match' });
            }
            user.password = password;
            user.confirmPassword = confirmPassword;
        }

        await user.save();
        res.status(200).json({
            message: 'Profile updated successfully',
            user: { _id: user._id, name: user.name, email: user.email, role: user.role, department: user.department, rollNo: user.rollNo },
        });
    } catch (error) {
        console.error('UpdateMe Error:', error);
        res.status(500).json({ message: 'Server error updating profile', error: error.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await dataModel.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json({ user });
    } catch (error) {
        console.error('UpdateUser Error:', error);
        res.status(500).json({ message: 'Server error updating user', error: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await dataModel.findByIdAndDelete(id);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('DeleteUser Error:', error);
        res.status(500).json({ message: 'Server error deleting user', error: error.message });
    }
};

export const getUser = async (req, res) => {
    try {
        // If authMiddleware was optional and no token was provided, req.user will be undefined
        if (!req.user) {
            return res.status(200).json({ user: null });
        }

        // req.user.id is set by authMiddleware after verifying the JWT
        const user = await dataModel.findById(req.user.id).select('-password -confirmPassword');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        console.error('GetUser Error:', error);
        res.status(500).json({ message: 'Server error fetching user', error: error.message });
    }
};