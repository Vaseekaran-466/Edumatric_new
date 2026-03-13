import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const TeacherDashboard = () => {
    const { user } = useAuth();
    const { courses, users, assignments, submissions } = useData();

    const totalStudents = (users || []).filter(u => u.role === 'student').length;
    const pendingSubmissions = (submissions || []).filter(s => s.status === 'pending');
    const gradedCount = (submissions || []).filter(s => s.status === 'graded').length;

    // Assignments with their pending submission counts for the "needs grading" list
    const assignmentsNeedingGrading = (assignments || [])
        .map(a => ({
            ...a,
            pendingCount: pendingSubmissions.filter(
                s => String(s.assignmentId?._id || s.assignmentId) === String(a._id)
            ).length
        }))
        .filter(a => a.pendingCount > 0)
        .sort((a, b) => b.pendingCount - a.pendingCount)
        .slice(0, 4);

    // Assignments closing within 3 days
    const closingAssignments = (assignments || [])
        .filter(a => {
            const d = Math.ceil((new Date(a.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
            return d >= 0 && d <= 3;
        })
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 3);

    // Bar chart values (static placeholder kept for style, but shows actual submission ratio)
    const submissionRatio = submissions.length > 0
        ? Math.round((gradedCount / submissions.length) * 100)
        : 0;

    return (
        <div className="animate-in fade-in duration-500">
            <div className="mb-8 text-left">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                    Welcome, {user?.name?.split(' ')[0]} 👋
                </h2>
                <p className="text-slate-500 text-sm mt-1">Manage your academic workflows and student interactions.</p>
            </div>

            {/* Urgent alert: pending submissions */}
            {pendingSubmissions.length > 0 && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-4">
                    <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center flex-shrink-0 text-base">📬</div>
                    <div className="flex-1">
                        <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Grading Required</p>
                        <p className="text-sm text-amber-800 font-medium mt-0.5">
                            {pendingSubmissions.length} submission{pendingSubmissions.length > 1 ? 's' : ''} waiting for your feedback
                        </p>
                    </div>
                    <Link to="/teacher/assignments" className="text-[10px] font-bold text-amber-600 uppercase tracking-widest hover:underline whitespace-nowrap">
                        Grade Now →
                    </Link>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-slate-100 rounded-lg">
                            <span className="font-bold text-xs text-slate-500 uppercase tracking-wider">Courses</span>
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-slate-800">{(courses || []).length.toString().padStart(2, '0')}</p>
                    <p className="text-xs text-slate-400 font-semibold mt-2 uppercase tracking-wider">Active Modules</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-brand-accent/10 rounded-lg">
                            <span className="font-bold text-xs text-brand-accent uppercase tracking-wider">Tasks</span>
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-slate-800">{(assignments || []).length.toString().padStart(2, '0')}</p>
                    <p className="text-xs text-slate-400 font-semibold mt-2 uppercase tracking-wider">Total Assignments</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-slate-100 rounded-lg">
                            <span className="font-bold text-xs text-slate-500 uppercase tracking-wider">Students</span>
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-slate-800">{totalStudents.toString().padStart(2, '0')}</p>
                    <p className="text-xs text-slate-400 font-semibold mt-2 uppercase tracking-wider">Enrolled Members</p>
                </div>

                <div className={`p-6 rounded-xl border shadow-sm hover:shadow-md transition-all ${pendingSubmissions.length > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-2 rounded-lg ${pendingSubmissions.length > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                            <span className={`font-bold text-xs uppercase tracking-wider ${pendingSubmissions.length > 0 ? 'text-red-600' : 'text-green-600'}`}>Pending</span>
                        </div>
                    </div>
                    <p className={`text-3xl font-bold ${pendingSubmissions.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {pendingSubmissions.length.toString().padStart(2, '0')}
                    </p>
                    <p className={`text-xs font-semibold mt-2 uppercase tracking-wider ${pendingSubmissions.length > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        Ungraded Submissions
                    </p>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Needs Grading List */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-left">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h4 className="text-base font-bold text-slate-800 uppercase tracking-tight">Needs Grading</h4>
                            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">
                                {assignmentsNeedingGrading.length > 0 ? `${pendingSubmissions.length} total pending` : 'All submissions graded ✓'}
                            </p>
                        </div>
                        <Link to="/teacher/assignments" className="text-[10px] font-bold text-brand-primary hover:underline uppercase tracking-wider">
                            Open →
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {assignmentsNeedingGrading.length > 0 ? assignmentsNeedingGrading.map(a => (
                            <div key={a._id} className="flex items-center justify-between p-4 bg-amber-50 border border-amber-100 rounded-xl">
                                <div>
                                    <p className="text-sm font-bold text-slate-800">{a.title}</p>
                                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                                        Due: {new Date(a.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                    </p>
                                </div>
                                <span className="px-3 py-1.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg">
                                    {a.pendingCount} pending
                                </span>
                            </div>
                        )) : (
                            <div className="py-8 text-center bg-green-50 rounded-xl border border-green-100">
                                <div className="text-2xl mb-2">✅</div>
                                <p className="text-xs font-bold text-green-600 uppercase tracking-widest">All caught up!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Closing Deadlines */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm text-left">
                    <div className="mb-6">
                        <h4 className="text-base font-bold text-slate-800 uppercase tracking-tight">Closing Soon</h4>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">Assignments due within 3 days</p>
                    </div>
                    <div className="space-y-3">
                        {closingAssignments.length > 0 ? closingAssignments.map(a => {
                            const daysLeft = Math.ceil((new Date(a.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                            return (
                                <div key={a._id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{a.title}</p>
                                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                                            {a.type === 'quiz' ? 'Quiz' : 'Assignment'} · {a.points} pts
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1.5 text-xs font-bold rounded-lg ${daysLeft === 0 ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                        {daysLeft === 0 ? 'Today' : `${daysLeft}d left`}
                                    </span>
                                </div>
                            );
                        }) : (
                            <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No deadlines in 3 days</p>
                            </div>
                        )}
                    </div>

                    {/* Submission progress bar */}
                    {submissions.length > 0 && (
                        <div className="mt-6 pt-5 border-t border-slate-100">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Grading Progress</span>
                                <span className="text-[10px] font-bold text-slate-600">{gradedCount}/{submissions.length}</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div
                                    className="h-2 bg-brand-primary rounded-full transition-all duration-700"
                                    style={{ width: `${submissionRatio}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">{submissionRatio}% submissions graded</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
