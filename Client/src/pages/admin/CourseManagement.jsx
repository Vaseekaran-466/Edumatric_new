import { useState } from 'react';
import { useData } from '../../context/DataContext';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';

const CourseManagement = () => {
    const { courses, users, addCourse, deleteCourse, enrollStudent } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [formData, setFormData] = useState({ title: '', instructor: '', description: '' });

    const columns = [
        { header: 'Course Name', accessor: 'title' },
        { header: 'Instructor', accessor: 'instructor' },
        {
            header: 'Enrollment',
            accessor: 'students',
            render: (row) => (
                <span className="bg-slate-100 px-3 py-1 rounded-md text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {row.students?.length || 0} Members
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: 'actions',
            render: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => { setSelectedCourse(row); setIsEnrollModalOpen(true); }}
                        className="p-2 text-brand-primary hover:bg-brand-primary/5 rounded-lg transition-colors border border-transparent hover:border-brand-primary/10"
                        title="Enroll Students"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => handleDelete(row._id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Course"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            )
        },
    ];

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            deleteCourse(id);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await addCourse({ ...formData, students: [] });
        if (result && result.success) {
            setIsModalOpen(false);
            setFormData({ title: '', instructor: '', description: '' });
        } else if (result && !result.success) {
            alert(result.message);
        }
    };

    const handleEnroll = async (e) => {
        e.preventDefault();
        if (!selectedStudent || !selectedCourse) return;

        const result = await enrollStudent(selectedCourse._id, selectedStudent);
        if (result.success) {
            setIsEnrollModalOpen(false);
            setSelectedStudent('');
        } else {
            alert(result.message);
        }
    };

    return (
        <div className="animate-in fade-in duration-500">
            {/* Professional Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden text-left">
                <div className="relative z-10 text-left">
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Curriculum Center</h2>
                    <p className="text-slate-500 text-sm mt-1">Manage the available educational content and instructors.</p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="relative z-10 bg-brand-primary text-white px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest shadow-sm hover:bg-slate-800 transition-all active:scale-95"
                >
                    Add Program
                </button>
            </div>

            {/* Table Container Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-left mb-8">
                <Table columns={columns} data={courses} />
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Program"
            >
                <form onSubmit={handleSubmit} className="space-y-6 p-2 text-left">
                    <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2 ml-1">Title</label>
                        <input
                            type="text"
                            required
                            placeholder="Course name"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-brand-accent/5 transition-all"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2 ml-1">Instructor</label>
                        <input
                            type="text"
                            required
                            placeholder="Professional name"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-brand-accent/5 transition-all"
                            value={formData.instructor}
                            onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2 ml-1">Description</label>
                        <textarea
                            required
                            rows="4"
                            placeholder="Detailed overview..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:bg-white transition-all resize-none"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 bg-brand-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all mt-4"
                    >
                        Initialize Course
                    </button>
                </form>
            </Modal>

            <Modal
                isOpen={isEnrollModalOpen}
                onClose={() => setIsEnrollModalOpen(false)}
                title={`Enroll Student to ${selectedCourse?.title}`}
            >
                <form onSubmit={handleEnroll} className="space-y-6 p-2 text-left">
                    <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2 ml-1">Select Student</label>
                        <select
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:bg-white transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_1rem_center] bg-no-repeat"
                            value={selectedStudent}
                            onChange={(e) => setSelectedStudent(e.target.value)}
                        >
                            <option value="">Choose a student...</option>
                            {users.filter(u => u.role === 'student' && !selectedCourse?.students?.some(s => s._id === u._id)).map(student => (
                                <option key={student._id} value={student._id}>
                                    {student.name} ({student.email})
                                </option>
                            ))}
                        </select>
                        <p className="text-[10px] text-slate-400 mt-2 ml-1 italic">Only showing students not yet enrolled.</p>
                    </div>

                    <button
                        type="submit"
                        disabled={!selectedStudent}
                        className="w-full py-4 bg-brand-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-brand-primary/10 disabled:opacity-50"
                    >
                        Confirm Enrollment
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default CourseManagement;
