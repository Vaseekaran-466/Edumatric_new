import { useState } from 'react';
import { useData } from '../../context/DataContext';
import Modal from '../../components/common/Modal';

const AssessmentTools = () => {
    const { courses, addAssignment, assignments, updateAssignment, deleteAssignment, submissions, users, gradeSubmission } = useData();
    const [formData, setFormData] = useState({
        title: '',
        courseId: '',
        dueDate: '',
        type: 'assignment',
        description: '',
        points: '100',
        materialContent: '',
        materialName: '',
        materialLink: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [viewSubmissionsFor, setViewSubmissionsFor] = useState(null);
    const [evaluatingSubmission, setEvaluatingSubmission] = useState(null);
    const [gradingData, setGradingData] = useState({ marks: '', feedback: '' });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setFormData({ ...formData, materialContent: event.target.result, materialName: file.name });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.courseId) {
            alert('Please select a course.');
            return;
        }

        const result = editingId
            ? await updateAssignment(editingId, formData)
            : await addAssignment(formData);

        if (result && result.success) {
            resetForm();
        } else if (result && !result.success) {
            alert(result.message);
        }
    };

    const handleEdit = (assignment) => {
        setFormData({
            title: assignment.title,
            courseId: assignment.courseId,
            dueDate: assignment.dueDate,
            type: assignment.type,
            description: assignment.description || '',
            points: assignment.points || '100',
            materialContent: assignment.materialContent || '',
            materialName: assignment.materialName || '',
            materialLink: assignment.materialLink || ''
        });
        setEditingId(assignment._id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this assessment?')) {
            deleteAssignment(id);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            courseId: '',
            dueDate: '',
            type: 'assignment',
            description: '',
            points: '100',
            materialContent: '',
            materialName: '',
            materialLink: ''
        });
        setEditingId(null);
    };

    const handleGradeSubmit = async (e) => {
        e.preventDefault();
        const result = await gradeSubmission(evaluatingSubmission._id, gradingData);
        if (result.success) {
            setEvaluatingSubmission(null);
            setGradingData({ marks: '', feedback: '' });
        }
    };

    const filteredAssignments = assignments ? assignments.filter(a => {
        const matchesSearch = a.title?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterType === 'all' || a.type === filterType;
        return matchesSearch && matchesFilter;
    }) : [];

    const getCourseName = (id) => {
        const course = (courses || []).find(c => c._id === id);
        return course ? course.title : 'External Course';
    };

    const activeSubmissions = (submissions || []).filter(s => String(s.assignmentId?._id || s.assignmentId) === String(viewSubmissionsFor?._id));
    const pendingCount = (submissions || []).filter(s => s.status === 'pending').length;
    const gradedCount = (submissions || []).filter(s => s.status === 'graded').length;

    return (
        <div className="animate-in fade-in duration-500">
            {/* Enhanced Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden text-left">
                <div className="relative z-10 text-left">
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Assessment Center</h2>
                    <p className="text-slate-500 text-sm mt-1">Create assignments, quizzes, and evaluate student work.</p>
                </div>

                <div className="flex gap-3 relative z-10">
                    <div className="bg-slate-50 px-5 py-3 rounded-xl border border-slate-100 text-center min-w-[100px]">
                        <div className="text-xl font-bold text-slate-800">{(assignments || []).length}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Total</div>
                    </div>
                    <div className="bg-amber-50 px-5 py-3 rounded-xl border border-amber-100 text-center min-w-[100px]">
                        <div className="text-xl font-bold text-amber-600">{pendingCount}</div>
                        <div className="text-[10px] font-bold text-amber-600/60 uppercase tracking-widest leading-none mt-1">Pending</div>
                    </div>
                    <div className="bg-green-50 px-5 py-3 rounded-xl border border-green-100 text-center min-w-[100px]">
                        <div className="text-xl font-bold text-green-600">{gradedCount}</div>
                        <div className="text-[10px] font-bold text-green-600/60 uppercase tracking-widest leading-none mt-1">Graded</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Enhanced Form Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-24">
                        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                {editingId ? (
                                    <>
                                        <svg className="w-4 h-4 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Edit Assessment
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                        </svg>
                                        New Assessment
                                    </>
                                )}
                            </h3>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="space-y-5 text-left">
                                <div>
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2 ml-1 text-left">Title</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g., Chapter 5 Quiz"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-brand-accent/5 focus:border-brand-accent transition-all"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-left">
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2 ml-1 text-left">Type</label>
                                        <select
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:bg-white transition-all appearance-none cursor-pointer"
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        >
                                            <option value="assignment">Assignment</option>
                                            <option value="quiz">Quiz</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2 ml-1 text-left">Max Points</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="1000"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:bg-white transition-all"
                                            value={formData.points}
                                            onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2 ml-1 text-left">Course</label>
                                    <select
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:bg-white transition-all cursor-pointer"
                                        value={formData.courseId}
                                        onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                                    >
                                        <option value="">Select Course</option>
                                        {courses && courses.map(c => (
                                            <option key={c._id} value={c._id}>{c.title}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2 ml-1 text-left">Due Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:bg-white transition-all"
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2 ml-1 text-left">Instructions (Optional)</label>
                                    <textarea
                                        rows="3"
                                        placeholder="Provide detailed instructions..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:bg-white transition-all resize-none"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2 ml-1 text-left">Resource Link (Optional)</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="https://..."
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:bg-white transition-all"
                                            value={formData.materialLink}
                                            onChange={(e) => setFormData({ ...formData, materialLink: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2 ml-1 text-left">Attach Resource (Optional)</label>
                                    <div className="relative">
                                        <input type="file" id="material-file" className="hidden" onChange={handleFileChange} />
                                        <label htmlFor="material-file" className="w-full py-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-all text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            {formData.materialName ? `📎 ${formData.materialName}` : '+ Upload File'}
                                        </label>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-sm ${editingId ? 'bg-brand-accent text-white hover:bg-purple-700' : 'bg-brand-primary text-white hover:bg-slate-800'}`}
                                >
                                    {editingId ? '✓ Update Assessment' : '+ Create Assessment'}
                                </button>
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="w-full bg-slate-50 text-slate-400 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-slate-100 transition-all"
                                    >
                                        Cancel Edit
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* Enhanced List Container */}
                <div className="lg:col-span-2 space-y-6 text-left">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
                        <div className="flex bg-slate-100 p-1.5 rounded-xl w-full sm:w-auto">
                            {['all', 'assignment', 'quiz'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setFilterType(tab)}
                                    className={`px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${filterType === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div className="relative flex-1 w-full text-left">
                            <input
                                type="text"
                                placeholder="Search assessments..."
                                className="w-full pl-10 pr-4 py-2.5 bg-transparent border-none text-sm font-semibold text-slate-700 outline-none placeholder-slate-300"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <svg className="h-4 w-4 text-slate-300 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                    </div>

                    {filteredAssignments.length > 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-left">
                            <div className="overflow-x-auto text-left">
                                <table className="min-w-full divide-y divide-slate-100 text-left">
                                    <thead className="bg-slate-50/50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Assessment</th>
                                            <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Due Date</th>
                                            <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">Submissions</th>
                                            <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredAssignments.map((assignment) => {
                                            const submissionCount = (submissions || []).filter(s => String(s.assignmentId?._id || s.assignmentId) === String(assignment._id)).length;
                                            const gradedSubmissions = (submissions || []).filter(s => String(s.assignmentId?._id || s.assignmentId) === String(assignment._id) && s.status === 'graded').length;

                                            return (
                                                <tr key={assignment._id} className="hover:bg-slate-50/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-bold text-slate-800 tracking-tight">{assignment.title}</div>
                                                        <div className="text-[11px] font-semibold text-slate-400 mt-0.5">{getCourseName(assignment.courseId)} • {assignment.points} Pts</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${assignment.type === 'quiz' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                            {assignment.type === 'quiz' ? '📝 Quiz' : '📄 Task'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-xs font-bold text-slate-600">{assignment.dueDate}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            onClick={() => setViewSubmissionsFor(assignment)}
                                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-brand-primary hover:text-white rounded-lg text-xs font-bold text-slate-700 transition-all"
                                                        >
                                                            <span>{submissionCount}</span>
                                                            {gradedSubmissions > 0 && (
                                                                <span className="text-[9px] opacity-60">({gradedSubmissions} graded)</span>
                                                            )}
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => handleEdit(assignment)} className="p-2 text-slate-400 hover:text-brand-primary hover:bg-slate-50 rounded-lg transition-colors" title="Edit">
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                            </button>
                                                            <button onClick={() => handleDelete(assignment._id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
                            <div className="text-4xl mb-4 opacity-20">📋</div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No assessments found</p>
                            <p className="text-xs text-slate-300 mt-2">Create your first assignment or quiz to get started</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Enhanced Submissions Modal */}
            <Modal
                isOpen={!!viewSubmissionsFor}
                onClose={() => setViewSubmissionsFor(null)}
                title={`Submissions: ${viewSubmissionsFor?.title}`}
            >
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {activeSubmissions.length > 0 ? activeSubmissions.map(sub => {
                        const student = users.find(u => String(u._id) === String(sub.studentId?._id || sub.studentId)) || sub.studentId;
                        return (
                            <div key={sub._id} className="p-5 bg-slate-50 border border-slate-200 rounded-xl hover:border-brand-accent/20 transition-all">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-brand-primary text-white rounded-lg flex items-center justify-center font-bold text-sm">
                                            {student?.name?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-800">{student?.name || 'Unknown Student'}</div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                                                Submitted: {new Date(sub.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        {sub.status === 'graded' ? (
                                            <div className="flex items-center gap-2">
                                                <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-50 text-green-600 border border-green-100">
                                                    ✓ {sub.marks}/{viewSubmissionsFor?.points} Pts
                                                </span>
                                                <button
                                                    onClick={() => {
                                                        setEvaluatingSubmission(sub);
                                                        setGradingData({ marks: sub.marks, feedback: sub.feedback || '' });
                                                    }}
                                                    className="px-4 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-slate-200 transition-colors"
                                                >
                                                    Re-grade
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setEvaluatingSubmission(sub)}
                                                className="px-5 py-2 bg-brand-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-slate-800 transition-colors"
                                            >
                                                Grade Now
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Submission Content */}
                                <div className="space-y-3">
                                    {/* Student Text Response */}
                                    {sub.text && (
                                        <div className="p-4 bg-white rounded-lg border border-slate-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                                </svg>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Student Notes</div>
                                            </div>
                                            <div className="text-sm text-slate-600 leading-relaxed">{sub.text}</div>
                                        </div>
                                    )}

                                    {/* Uploaded File - Automatic Inline Preview */}
                                    {sub.fileName && sub.fileUrl && (
                                        <div className="p-4 bg-white rounded-lg border border-slate-100">
                                            <div className="flex items-center gap-2 mb-3">
                                                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                </svg>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attached Work: {sub.fileName}</div>
                                            </div>

                                            <div className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                                                {sub.fileUrl.startsWith('data:image/') ? (
                                                    <img
                                                        src={sub.fileUrl}
                                                        alt="Submission Preview"
                                                        className="w-full h-auto max-h-[400px] object-contain block mx-auto cursor-pointer"
                                                        onClick={() => window.open(sub.fileUrl, '_blank')}
                                                    />
                                                ) : sub.fileUrl.startsWith('data:application/pdf') ? (
                                                    <iframe
                                                        src={sub.fileUrl}
                                                        className="w-full h-[400px] border-none"
                                                        title="PDF Submission Preview"
                                                    />
                                                ) : (
                                                    <div className="p-8 text-center">
                                                        <div className="w-12 h-12 bg-brand-accent/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                                                            <svg className="w-6 h-6 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                        </div>
                                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-tight mb-4">Preview not available for this file type</p>
                                                        <button
                                                            onClick={() => window.open(sub.fileUrl, '_blank')}
                                                            className="px-6 py-2 bg-brand-primary text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all"
                                                        >
                                                            Open File Manually
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Submitted Link */}
                                    {sub.link && (
                                        <div className="p-4 bg-white rounded-lg border border-slate-100">
                                            <div className="flex items-center gap-2 mb-3">
                                                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                </svg>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Submitted Link</div>
                                            </div>
                                            <a
                                                href={sub.link.startsWith('http') ? sub.link : `https://${sub.link}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors group"
                                            >
                                                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-xs font-bold text-blue-600 truncate group-hover:underline">{sub.link}</div>
                                                    <div className="text-[10px] text-blue-500 font-semibold">Click to open in new tab</div>
                                                </div>
                                            </a>
                                        </div>
                                    )}

                                    {/* If graded, show feedback */}
                                    {sub.status === 'graded' && sub.feedback && (
                                        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <div className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Teacher Feedback</div>
                                            </div>
                                            <div className="text-sm text-green-700 leading-relaxed italic">{sub.feedback}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <div className="text-4xl mb-3 opacity-20">📭</div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No submissions yet</p>
                            <p className="text-xs text-slate-300 mt-1">Students haven't submitted their work</p>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Enhanced Grading Modal */}
            <Modal
                isOpen={!!evaluatingSubmission}
                onClose={() => {
                    setEvaluatingSubmission(null);
                    setGradingData({ marks: '', feedback: '' });
                }}
                title="Grade Submission"
                maxWidth="max-w-2xl"
            >
                {evaluatingSubmission && (
                    <form onSubmit={handleGradeSubmit} className="flex flex-col max-h-[85vh]">
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6 mb-6">
                            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-xl border border-slate-200">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Student Response:</div>
                                <div className="text-sm font-medium text-slate-700 italic leading-relaxed mb-4">
                                    {evaluatingSubmission.text || 'No written response provided.'}
                                </div>
                                
                                {evaluatingSubmission.fileName && evaluatingSubmission.fileUrl && (
                                    <div className="mt-4 p-4 bg-white rounded-lg border border-slate-200">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Attached File: {evaluatingSubmission.fileName}</div>
                                        <div className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50 relative">
                                            {evaluatingSubmission.fileUrl.startsWith('data:image/') ? (
                                                <img
                                                    src={evaluatingSubmission.fileUrl}
                                                    alt="Submission"
                                                    className="w-full max-h-[300px] object-contain cursor-pointer"
                                                    onClick={() => window.open(evaluatingSubmission.fileUrl, '_blank')}
                                                />
                                            ) : evaluatingSubmission.fileUrl.startsWith('data:application/pdf') ? (
                                                <iframe
                                                    src={evaluatingSubmission.fileUrl}
                                                    className="w-full h-[350px] border-none"
                                                    title="PDF Preview"
                                                />
                                            ) : (
                                                <div className="p-4 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => window.open(evaluatingSubmission.fileUrl, '_blank')}
                                                        className="px-4 py-2 bg-brand-primary text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all"
                                                    >
                                                        Open Attached File
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {evaluatingSubmission.link && (
                                    <div className="mt-4 p-4 bg-white rounded-lg border border-slate-200">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Submitted Link</div>
                                        <a
                                            href={evaluatingSubmission.link.startsWith('http') ? evaluatingSubmission.link : `https://${evaluatingSubmission.link}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs font-bold text-blue-600 hover:underline break-all"
                                        >
                                            {evaluatingSubmission.link}
                                        </a>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2 ml-1">
                                        Score (Max: {viewSubmissionsFor?.points} points)
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        max={viewSubmissionsFor?.points || 100}
                                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-2xl font-bold text-brand-primary outline-none focus:bg-white focus:ring-4 focus:ring-brand-accent/5 focus:border-brand-accent transition-all text-center"
                                        value={gradingData.marks}
                                        onChange={(e) => setGradingData({ ...gradingData, marks: e.target.value })}
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2 ml-1">Feedback (Optional)</label>
                                    <textarea
                                        rows="4"
                                        placeholder="Provide constructive feedback..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-medium text-slate-700 outline-none focus:bg-white transition-all resize-none"
                                        value={gradingData.feedback}
                                        onChange={(e) => setGradingData({ ...gradingData, feedback: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full py-4 bg-brand-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-lg shadow-brand-primary/10"
                            >
                                ✓ Submit Grade
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default AssessmentTools;
