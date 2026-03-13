import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import Modal from '../../components/common/Modal';

const StudentManager = () => {
    const { users, addUser, updateUser, deleteUser } = useData();
    const allStudents = users.filter(u => u.role === 'student');
    const [showModal, setShowModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        rollNo: '',
        email: '',
        department: '',
        isActive: false
    });

    const filteredStudents = allStudents.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.rollNo && student.rollNo.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const openAddModal = () => {
        setEditingStudent(null);
        setFormData({ name: '', rollNo: '', email: '', department: '', isActive: false });
        setShowModal(true);
    };

    const openEditModal = (student) => {
        setEditingStudent(student);
        setFormData({
            name: student.name,
            rollNo: student.rollNo || '',
            email: student.email,
            department: student.department || '',
            isActive: student.isActive || false
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            const result = await deleteUser(id);
            if (result && !result.success) {
                alert(result.message);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let result;
        if (editingStudent) {
            result = await updateUser({ ...editingStudent, ...formData });
        } else {
            const newStudent = {
                ...formData,
                role: 'student',
                password: 'EduMatrix@2024',
                confirmPassword: 'EduMatrix@2024'
            };
            result = await addUser(newStudent);
        }

        if (result && result.success) {
            setShowModal(false);
            setEditingStudent(null);
            setFormData({ name: '', rollNo: '', email: '', department: '', isActive: false });
        } else if (result && !result.success) {
            alert(result.message);
        }
    };

    const exportToCSV = () => {
        if (!filteredStudents.length) return;

        const headers = ['Name', 'Roll Number', 'Email', 'Department', 'Account Status'];
        
        const rows = filteredStudents.map(student => {
            const escapeField = (field) => `"${String(field || '').replace(/"/g, '""')}"`;
            return [
                escapeField(student.name),
                escapeField(student.rollNo || 'N/A'),
                escapeField(student.email),
                escapeField(student.department || 'Unassigned'),
                escapeField(student.isActive ? 'Active' : 'Inactive')
            ].join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        const date = new Date().toISOString().split('T')[0];
        link.setAttribute('href', url);
        link.setAttribute('download', `students_list_${date}.csv`);
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight text-left">Student Management</h2>
                    <p className="text-slate-500 text-sm mt-1 text-left line-clamp-1">Manage enrollments, IDs, and student status across departments.</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-brand-accent/5 focus:border-brand-accent/30 outline-none transition-all"
                        />
                        <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <button
                        onClick={exportToCSV}
                        className="bg-white text-slate-600 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 hover:text-brand-primary hover:border-brand-primary/30 transition-all shadow-sm flex items-center gap-2 whitespace-nowrap"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="hidden sm:inline">Export Excel</span>
                    </button>
                    <button
                        onClick={openAddModal}
                        className="bg-brand-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all flex items-center gap-2"
                    >
                        <span>Add Student</span>
                    </button>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100 text-left">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Student Details</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Roll Number</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredStudents.map(student => (
                                <tr key={student._id} className="hover:bg-slate-50/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-brand-primary font-bold text-sm">
                                                {student.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-slate-800">{student.name}</div>
                                                <div className="text-xs text-slate-400 font-medium">{student.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">{student.rollNo || 'N/A'}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-600">
                                        {student.department || 'Unassigned'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${student.isActive ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${student.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                            {student.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => openEditModal(student)} className="p-2 text-slate-400 hover:text-brand-primary hover:bg-slate-50 rounded-lg transition-colors">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </button>
                                            <button onClick={() => handleDelete(student._id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingStudent ? 'Edit Student Profile' : 'Register New Student'}
            >
                <form onSubmit={handleSubmit} className="space-y-5 p-2 text-left">
                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Full Name</label>
                        <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:bg-white focus:ring-4 focus:ring-brand-accent/5 focus:border-brand-accent outline-none transition-all text-sm font-semibold bg-slate-50" placeholder="Johnathan Doe" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Roll Number</label>
                            <input type="text" name="rollNo" required value={formData.rollNo} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:bg-white focus:ring-4 focus:ring-brand-accent/5 focus:border-brand-accent outline-none transition-all text-sm font-semibold bg-slate-50" placeholder="STU-2024" />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Department</label>
                            <input type="text" name="department" required value={formData.department} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:bg-white focus:ring-4 focus:ring-brand-accent/5 focus:border-brand-accent outline-none transition-all text-sm font-semibold bg-slate-50" placeholder="Science" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Email Address</label>
                        <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:bg-white focus:ring-4 focus:ring-brand-accent/5 focus:border-brand-accent outline-none transition-all text-sm font-semibold bg-slate-50" placeholder="user@email.com" />
                    </div>

                    <div className="flex items-center pt-2">
                        <label className="inline-flex items-center cursor-pointer">
                            <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-brand-success after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                            <span className="ml-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Account Active</span>
                        </label>
                    </div>

                    <button type="submit" className="w-full py-3.5 bg-brand-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all mt-4">
                        {editingStudent ? 'Save Changes' : 'Initialize Enrollment'}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default StudentManager;
