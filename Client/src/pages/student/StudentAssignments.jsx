import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';

const StudentAssignments = () => {
    const { user } = useAuth();
    const { assignments, courses, submitAssignment, submissions } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');

    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submissionData, setSubmissionData] = useState({ text: '', fileName: '', fileUrl: '', link: '' });

    const getCourseName = (id) => {
        if (!courses || !Array.isArray(courses)) return 'Course';
        const course = courses.find(c => String(c._id || c.id) === String(id));
        return course ? course.title : 'Course';
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setSubmissionData({ ...submissionData, fileUrl: event.target.result, fileName: file.name });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleOpenSubmission = (assignment) => {
        setSelectedAssignment(assignment);
        setSubmissionData({ text: '', fileName: '', fileUrl: '', link: '' });
        setIsModalOpen(true);
    };

    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        const result = await submitAssignment({
            studentId: String(user?._id || user?.id),
            assignmentId: String(selectedAssignment?._id || selectedAssignment?.id),
            ...submissionData
        });

        if (result.success) {
            alert('Submission uploaded successfully!');
            setIsModalOpen(false);
        } else {
            alert(result.message || 'Failed to submit assignment. Please try again.');
        }
    };

    const filteredAssignments = (assignments || []).filter(a => {
        const myCourseIds = (courses || [])
            .filter(c => c.students && c.students.some(sObj => String(sObj?._id || sObj?.id || sObj) === String(user?.id || user?._id)))
            .map(c => String(c._id || c.id));

        const matchesCourse = myCourseIds.includes(String(a.courseId?._id || a.courseId));
        const matchesSearch = a.title?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === 'all' || a.type === activeTab;

        return matchesCourse && matchesSearch && matchesTab;
    });

    return (
        <div className="animate-in fade-in duration-500 text-left">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden text-left">
                <div className="relative z-10 text-left">
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Assignment Portal</h2>
                    <p className="text-slate-500 text-sm mt-1">Submit your academic tasks and track your evaluations.</p>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-xl relative z-10">
                    {['all', 'assignment', 'quiz'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === tab
                                ? 'bg-white text-slate-800 shadow-sm'
                                : 'text-slate-400 hover:text-brand-primary'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Controls */}
            <div className="mb-8">
                <div className="relative max-w-md">
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-brand-accent/5 focus:border-brand-accent outline-none transition-all shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <svg className="h-4 w-4 text-slate-300 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
            </div>

            {/* Tasks Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-left mb-8">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Task Details</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Type</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Max Points</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Deadline</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Evaluation</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredAssignments.length > 0 ? filteredAssignments.map((assignment) => {
                                const assignmentId = String(assignment._id || assignment.id);
                                const submission = (submissions || []).find(s => 
                                    String(s.assignmentId?._id || s.assignmentId?.id || s.assignmentId) === assignmentId && 
                                    String(s.studentId?._id || s.studentId?.id || s.studentId) === String(user?.id || user?._id)
                                );
                                return (
                                    <tr key={assignmentId} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-700 italic group-hover:text-brand-primary transition-colors">{assignment.title}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">{getCourseName(assignment.courseId)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex justify-center">
                                                <span className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border ${assignment.type === 'quiz' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-brand-accent/5 text-brand-accent border-brand-accent/10'}`}>
                                                    {assignment.type}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-center text-xs font-bold text-slate-600">
                                                {assignment.points || 100}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-center text-xs font-bold text-red-500 uppercase">
                                                {assignment.dueDate}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex justify-center">
                                                {submission?.status === 'graded' ? (
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-sm font-bold text-green-600">{submission.marks} / {assignment.points || 100}</span>
                                                        <span className="text-[8px] font-bold text-green-400 uppercase mt-0.5">Scored</span>
                                                    </div>
                                                ) : submission ? (
                                                    <span className="px-3 py-1 bg-slate-100 text-slate-400 rounded-lg text-[9px] font-bold uppercase tracking-widest">Pending</span>
                                                ) : (
                                                    <span className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">—</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex justify-end">
                                                {submission?.status === 'graded' ? (
                                                    <button
                                                        disabled
                                                        className="px-4 py-2 bg-green-50 text-green-600 rounded-lg text-[9px] font-bold uppercase tracking-widest cursor-default border border-green-100"
                                                    >
                                                        Completed
                                                    </button>
                                                ) : submission ? (
                                                    <button
                                                        disabled
                                                        className="px-4 py-2 bg-slate-50 text-slate-400 rounded-lg text-[9px] font-bold uppercase tracking-widest cursor-default border border-slate-100"
                                                    >
                                                        Submitted
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleOpenSubmission(assignment)}
                                                        className="px-5 py-2 bg-brand-primary text-white rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm"
                                                    >
                                                        {assignment.type === 'quiz' ? 'Start Quiz' : 'Finalize Task'}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center">
                                        <div className="flex flex-col items-center opacity-30">
                                            <div className="text-4xl mb-3">📋</div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No active tasks found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Academic Submission"
                maxWidth="max-w-2xl"
            >
                <form onSubmit={handleFinalSubmit} className="flex flex-col max-h-[85vh] text-left">
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6 mb-6">
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Instructions</h4>
                            <p className="text-xs text-slate-600 font-semibold leading-relaxed mb-4">
                                {selectedAssignment?.description || "Follow the program guidelines for this module."}
                            </p>

                            {(selectedAssignment?.materialContent || selectedAssignment?.materialLink) && (
                                <div className="pt-4 border-t border-slate-200 mt-4">
                                    <h5 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Reference Resources</h5>
                                    <div className="space-y-2">
                                        {selectedAssignment?.materialContent && (
                                            <a
                                                href={selectedAssignment.materialContent}
                                                download={selectedAssignment.materialName || 'Resource'}
                                                className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-lg hover:border-brand-accent/30 transition-all group"
                                            >
                                                <svg className="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                                <span className="text-xs font-bold text-slate-700 truncate">{selectedAssignment.materialName || 'Download Material'}</span>
                                            </a>
                                        )}
                                        {selectedAssignment?.materialLink && (
                                            <a
                                                href={selectedAssignment.materialLink.startsWith('http') ? selectedAssignment.materialLink : `https://${selectedAssignment.materialLink}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-all group"
                                            >
                                                <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                </svg>
                                                <span className="text-xs font-bold text-blue-600 truncate">{selectedAssignment.materialLink}</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 ml-1">Comments / Notes</label>
                                <textarea
                                    required
                                    rows="3"
                                    placeholder="Explain your submission..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-brand-accent/5 focus:border-brand-accent transition-all resize-none shadow-sm"
                                    value={submissionData.text}
                                    onChange={(e) => setSubmissionData({ ...submissionData, text: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 ml-1">Attachment (File)</label>
                                    <div className="relative group">
                                        <input type="file" id="sub-file" className="hidden" onChange={handleFileChange} />
                                        <label htmlFor="sub-file" className="w-full h-32 flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer group-hover:bg-slate-100 group-hover:border-brand-accent/30 transition-all text-center p-4">
                                            <svg className="w-6 h-6 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight break-all">
                                                {submissionData.fileName || 'Upload Document'}
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 ml-1">External Link (Required for links)</label>
                                    <div className="h-32 flex flex-col bg-slate-50 border border-slate-200 rounded-xl p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                            </svg>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Share URL</span>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="https://example.com"
                                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all mt-auto"
                                            value={submissionData.link}
                                            onChange={(e) => setSubmissionData({ ...submissionData, link: e.target.value })}
                                        />
                                        <p className="text-[8px] text-slate-400 mt-2 italic">GitHub, Drive, or Portfolio link</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            className="w-full py-4 bg-brand-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 active:scale-[0.98] transition-all shadow-lg shadow-brand-primary/10"
                        >
                            ✓ Submit Work
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default StudentAssignments;
