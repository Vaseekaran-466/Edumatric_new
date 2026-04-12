import Material from '../module/materialModel.js';
import Course from '../module/courseModel.js';

// ─── Add Material ─────────────────────────────────────────────────────────────
export const addMaterial = async (req, res) => {
    try {
        console.log('Incoming Material Data:', req.body);
        const { title, courseId, type, url, description } = req.body;

        // Validation with more detailed logging
        if (!title || !courseId || !url) {
            console.error('Validation Failed:', { title: !!title, courseId: !!courseId, url: !!url });
            return res.status(400).json({ message: 'title, courseId, and url are required' });
        }

        const material = await Material.create({
            title, courseId, type, url, description,
            uploadedBy: req.user.id,
        });
        res.status(201).json({ message: 'Material added', material });
    } catch (error) {
        console.error('addMaterial Error:', error);
        res.status(500).json({ message: 'Failed to add material', error: error.message });
    }
};

// ─── Get All Materials ────────────────────────────────────────────────────────
export const getAllMaterials = async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'student') {
            // Find courses where student is enrolled
            const enrolledCourses = await Course.find({ students: req.user.id }).select('_id').lean();
            const courseIds = enrolledCourses.map(c => c._id);
            query = { courseId: { $in: courseIds } };
        } else if (req.user.role === 'teacher') {
            query = { uploadedBy: req.user.id };
        }

        const materials = await Material.find(query)
            .populate('uploadedBy', 'name')
            .sort({ createdAt: -1 })
            .lean();
        res.status(200).json({ materials });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch all materials', error: error.message });
    }
};

// ─── Get Materials by Course ──────────────────────────────────────────────────
export const getMaterialsByCourse = async (req, res) => {
    try {
        const materials = await Material.find({ courseId: req.params.courseId })
            .populate('uploadedBy', 'name')
            .sort({ createdAt: -1 })
            .lean();
        res.status(200).json({ materials });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch materials', error: error.message });
    }
};

// ─── Update Material ──────────────────────────────────────────────────────────
export const updateMaterial = async (req, res) => {
    try {
        const material = await Material.findByIdAndUpdate(req.params.id, req.body, {
            new: true, runValidators: true,
        });
        if (!material) return res.status(404).json({ message: 'Material not found' });
        res.status(200).json({ message: 'Material updated', material });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update material', error: error.message });
    }
};

// ─── Delete Material ──────────────────────────────────────────────────────────
export const deleteMaterial = async (req, res) => {
    try {
        const material = await Material.findByIdAndDelete(req.params.id);
        if (!material) return res.status(404).json({ message: 'Material not found' });
        res.status(200).json({ message: 'Material deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete material', error: error.message });
    }
};
