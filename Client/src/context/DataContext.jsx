import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    // ── State ─────────────────────────────────────────────────────────────────
    const [courses, setCourses] = useState([]);
    const [users, setUsers] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    // ── Fetch all core data on mount ──────────────────────────────────────────
    const fetchCourses = useCallback(async () => {
        try {
            const { data } = await api.get('/courses');
            setCourses(data.courses || []);
        } catch (e) { console.error('fetchCourses:', e.message); }
    }, []);

    const fetchAssignments = useCallback(async () => {
        try {
            const { data } = await api.get('/assignments');
            setAssignments(data.assignments || []);
        } catch (e) { console.error('fetchAssignments:', e.message); }
    }, []);

    const fetchAllSubmissions = useCallback(async () => {
        try {
            const { data } = await api.get('/submissions');
            setSubmissions(data.submissions || []);
        } catch (e) { console.error('fetchAllSubmissions:', e.message); }
    }, []);

    const fetchMyAttendance = useCallback(async () => {
        try {
            const { data } = await api.get('/attendance/mine');
            setAttendance(data.myAttendance || []);
        } catch (e) { console.error('fetchMyAttendance:', e.message); }
    }, []);

    const fetchMaterials = useCallback(async () => {
        try {
            const { data } = await api.get('/materials');
            setMaterials(data.materials || []);
        } catch (e) { console.error('fetchMaterials:', e.message); }
    }, []);

    const fetchUsers = useCallback(async () => {
        try {
            const { data } = await api.get('/users');
            setUsers(data.users || []);
        } catch (e) { console.error('fetchUsers:', e.message); }
    }, []);

    const fetchStats = useCallback(async () => {
        try {
            const { data } = await api.get('/stats');
            setStats(data.stats);
        } catch (e) { console.error('fetchStats:', e.message); }
    }, []);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        const tasks = [
            fetchCourses(),
            fetchAssignments(),
            fetchAllSubmissions(),
            fetchMyAttendance(),
            fetchMaterials()
        ];

        // Only admins and teachers can see user lists (teachers manage students)
        if (user?.role === 'admin' || user?.role === 'teacher') {
            tasks.push(fetchUsers());
        }

        // Only admins and teachers can see dashboard stats
        if (user?.role === 'admin' || user?.role === 'teacher') {
            tasks.push(fetchStats());
        }

        await Promise.all(tasks);
        setLoading(false);
    }, [fetchCourses, fetchAssignments, fetchAllSubmissions, fetchMaterials, fetchUsers, fetchStats, user?.role]);

    useEffect(() => {
        if (user) {
            fetchAll();
        }
    }, [fetchAll, user]);

    // ── Course Operations ─────────────────────────────────────────────────────
    const addCourse = useCallback(async (courseData) => {
        try {
            const { data } = await api.post('/courses', courseData);
            setCourses(prev => [data.course, ...prev]);
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to create course';
            return { success: false, message };
        }
    }, []);

    const deleteCourse = useCallback(async (id) => {
        try {
            await api.delete(`/courses/${id}`);
            setCourses(prev => prev.filter(c => c._id !== id));
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Failed to delete course' };
        }
    }, []);

    const enrollStudent = useCallback(async (courseId, studentId) => {
        try {
            const { data } = await api.post(`/courses/${courseId}/enroll`, { studentId });
            setCourses(prev => prev.map(c => c._id === courseId ? data.course : c));
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Enroll failed' };
        }
    }, []);

    // ── User Operations (Admin) ───────────────────────────────────────────────
    // Users list comes from /me for own profile; admin user list is served from the
    // existing /me endpoint (extend later with an admin-specific endpoint if needed)
    const addUser = useCallback(async (userData) => {
        try {
            // Admin/teacher endpoint creates users without logging them in
            const { data } = await api.post('/users', userData);
            setUsers(prev => [...prev, data.user]);
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Failed to add user' };
        }
    }, []);

    const updateUser = useCallback(async (userUpdates) => {
        try {
            const { _id, ...updates } = userUpdates;
            const { data } = await api.put(`/users/${_id}`, updates);
            setUsers(prev => prev.map(u => u._id === _id ? data.user : u));
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Failed to update user' };
        }
    }, []);

    const deleteUser = useCallback(async (id) => {
        try {
            await api.delete(`/users/${id}`);
            setUsers(prev => prev.filter(u => u._id !== id));
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Failed to delete user' };
        }
    }, []);

    const updateMe = useCallback(async (profileData) => {
        try {
            const { data } = await api.patch('/me', profileData);
            return { success: true, user: data.user };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Update failed' };
        }
    }, []);

    // ── Assignment Operations ─────────────────────────────────────────────────
    const addAssignment = useCallback(async (assignmentData) => {
        try {
            const { data } = await api.post('/assignments', assignmentData);
            setAssignments(prev => [data.assignment, ...prev]);
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Failed to create assignment' };
        }
    }, []);

    const updateAssignment = useCallback(async (id, updates) => {
        try {
            const { data } = await api.put(`/assignments/${id}`, updates);
            setAssignments(prev => prev.map(a => a._id === id ? data.assignment : a));
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Failed to update' };
        }
    }, []);

    const deleteAssignment = useCallback(async (id) => {
        try {
            await api.delete(`/assignments/${id}`);
            setAssignments(prev => prev.filter(a => a._id !== id));
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Failed to delete' };
        }
    }, []);

    // ── Submission Operations ─────────────────────────────────────────────────
    const submitAssignment = useCallback(async (submissionData) => {
        try {
            const { data } = await api.post('/submissions', submissionData);
            setSubmissions(prev => {
                const exists = prev.find(s => s.assignmentId === submissionData.assignmentId);
                if (exists) return prev.map(s => s.assignmentId === submissionData.assignmentId ? data.submission : s);
                return [data.submission, ...prev];
            });
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Submission failed' };
        }
    }, []);

    const gradeSubmission = useCallback(async (submissionId, gradeData) => {
        try {
            const { data } = await api.patch(`/submissions/${submissionId}/grade`, gradeData);
            setSubmissions(prev => prev.map(s => s._id === submissionId ? data.submission : s));
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Grading failed' };
        }
    }, []);

    const getSubmissionsByAssignment = async (assignmentId) => {
        try {
            const { data } = await api.get(`/submissions/assignment/${assignmentId}`);
            return { success: true, submissions: data.submissions };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Failed to fetch' };
        }
    };

    // ── Attendance Operations ─────────────────────────────────────────────────
    const markAttendance = useCallback(async (courseId, date, records) => {
        try {
            const dateStr = new Date(date).toISOString().split('T')[0];
            const { data } = await api.post('/attendance', { courseId, date: dateStr, records });
            setAttendance(prev => {
                const filtered = prev.filter(a => !(String(a.courseId) === String(courseId) && new Date(a.date).toISOString().split('T')[0] === dateStr));
                return [data.attendance, ...filtered];
            });
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Attendance failed' };
        }
    }, []);

    const getAttendanceByCourse = useCallback(async (courseId) => {
        try {
            const { data } = await api.get(`/attendance/${courseId}`);
            setAttendance(data.attendance || []);
            return { success: true, attendance: data.attendance };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Failed to fetch' };
        }
    }, []);

    // Kept for backward-compat with components that call getAttendance(date, studentId)
    const getAttendance = (date, studentId) => {
        const record = attendance.find(a => a.date === date);
        if (!record) return 'undefined';
        const entry = record.records?.find(r => r.studentId === studentId || r.studentId?._id === studentId || r.studentId?._id === studentId);
        return entry?.status || 'undefined';
    };

    // ── Material Operations ───────────────────────────────────────────────────
    const addMaterial = useCallback(async (materialData) => {
        try {
            const { data } = await api.post('/materials', materialData);
            setMaterials(prev => [data.material, ...prev]);
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Failed to add material' };
        }
    }, []);

    const getMaterialsByCourse = async (courseId) => {
        try {
            const { data } = await api.get(`/materials/course/${courseId}`);
            setMaterials(data.materials || []);
            return { success: true, materials: data.materials };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Failed to fetch materials' };
        }
    };

    const deleteMaterial = useCallback(async (id) => {
        try {
            await api.delete(`/materials/${id}`);
            setMaterials(prev => prev.filter(m => m._id !== id));
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Failed to delete' };
        }
    }, []);

    return (
        <DataContext.Provider value={{
            // State
            courses, users, assignments, submissions, attendance, materials, stats, loading,
            // Course
            addCourse, deleteCourse, enrollStudent, fetchCourses,
            // Users
            addUser, updateUser, deleteUser, updateMe, fetchStats,
            // Assignments
            addAssignment, updateAssignment, deleteAssignment, fetchAssignments,
            // Submissions
            submitAssignment, gradeSubmission, getSubmissionsByAssignment, fetchAllSubmissions,
            // Attendance
            markAttendance, getAttendance, getAttendanceByCourse, fetchMyAttendance,
            // Materials
            addMaterial, getMaterialsByCourse, deleteMaterial,
        }}>
            {children}
        </DataContext.Provider>
    );
};
