import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dataModel from '../module/model.js';
import Course from '../module/courseModel.js';
import Assignment from '../module/assignmentModel.js';
import Material from '../module/materialModel.js';

const isDatabaseUnavailableError = (error) => {
    const message = error?.message || '';

    return [
        'MongoNetworkError',
        'MongoServerSelectionError',
        'MongooseServerSelectionError',
    ].includes(error?.name) || /buffercommands|initial connection|server selection|ssl|tls|topology|connection/i.test(message);
};

const sendServerError = (res, error, message) => {
    if (isDatabaseUnavailableError(error)) {
        return res.status(503).json({
            message: 'Database unavailable. Please try again shortly.',
            code: 'DB_UNAVAILABLE',
        });
    }

    return res.status(500).json({ message, error: error.message });
};

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

    // Set HttpOnly cookie for same-origin / local-dev usage
    // SameSite=None + Secure required for cross-origin, but browsers increasingly
    // block third-party cookies — the Authorization header is the primary channel
    // in production (Vercel → Render).
    res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Return the raw token so the client can store it in sessionStorage
    // and send it via Authorization: Bearer for cross-origin requests.
    return token;
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

        const token = sendToken(res, user);

        res.status(201).json({
            message: 'User registered successfully',
            token, // returned for cross-origin Authorization header use
            user: { _id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (error) {
        console.error('Register Error:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({ message: 'Validation failed', errors: messages });
        }
        return sendServerError(res, error, 'Server error during registration');
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
        return sendServerError(res, error, 'Server error creating user');
    }
};

// ─── Login ───────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();
        const { password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Explicitly select password — it is excluded by default in the schema for security
        const user = await dataModel.findOne({ email })
            .select('_id name email role password')
            .lean();
        if (!user) {
            // Deliberately vague: do not expose whether email exists
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = sendToken(res, user);

        res.status(200).json({
            message: 'Login successful',
            token, // returned for cross-origin Authorization header use
            user: { _id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (error) {
        console.error('LOGIN_CRASH_DETAILED:', {
            error: error.message,
            stack: error.stack,
            body: { ...req.body, password: '***' }
        });
        return sendServerError(res, error, 'Server error during login');
    }
};

// ─── Logout ──────────────────────────────────────────────────────────────────
export const logout = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

// ─── Get Current User ────────────────────────────────────────────────────────
export const getAllUsers = async (req, res) => {
    try {
        const users = await dataModel.find({})
            .select('_id name email role rollNo department isActive createdAt updatedAt')
            .sort({ createdAt: -1 })
            .lean();
        res.status(200).json({ users });
    } catch (error) {
        console.error('GetAllUsers Error:', error);
        return sendServerError(res, error, 'Server error fetching users');
    }
};

export const getStats = async (req, res) => {
    try {
        const [totalUsers, totalCourses, totalAssignments, totalMaterials] = await Promise.all([
            dataModel.countDocuments(),
            Course.countDocuments({ isActive: true }),
            Assignment.countDocuments(),
            Material.countDocuments(),
        ]);

        res.status(200).json({
            stats: { totalUsers, totalCourses, totalAssignments, totalMaterials },
        });
    } catch (error) {
        console.error('GetStats Error:', error);
        return sendServerError(res, error, 'Server error fetching stats');
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
        return sendServerError(res, error, 'Server error updating profile');
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await dataModel.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json({ user });
    } catch (error) {
        console.error('UpdateUser Error:', error);
        return sendServerError(res, error, 'Server error updating user');
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await dataModel.findByIdAndDelete(id);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('DeleteUser Error:', error);
        return sendServerError(res, error, 'Server error deleting user');
    }
};

export const getUser = async (req, res) => {
    try {
        // If authMiddleware was optional and no token was provided, req.user will be undefined
        if (!req.user) {
            return res.status(200).json({ user: null });
        }

        // req.user.id is set by authMiddleware after verifying the JWT
        const user = await dataModel.findById(req.user.id)
            .select('_id name email role department rollNo')
            .lean();
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        console.error('GetUser Error:', error);
        return sendServerError(res, error, 'Server error fetching user');
    }
};
