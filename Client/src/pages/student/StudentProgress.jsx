import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

const StudentProgress = () => {
    const { user } = useAuth();
    const { submissions, assignments, courses, attendance } = useData();

    const myGrades = (submissions || [])
        .filter(s => String(s.studentId?._id || s.studentId?.id || s.studentId) === String(user?.id || user?._id) && s.status === 'graded')
        .map(sub => {
            const assignment = assignments.find(a => String(a._id || a.id) === String(sub.assignmentId?._id || sub.assignmentId));
            const course = courses.find(c => String(c._id || c.id) === String(assignment?.courseId?._id || assignment?.courseId));
            const percentage = (sub.marks / (assignment?.points || 100)) * 100;

            let grade = 'F';
            if (percentage >= 90) grade = 'A+';
            else if (percentage >= 80) grade = 'A';
            else if (percentage >= 70) grade = 'B';
            else if (percentage >= 60) grade = 'C';
            else if (percentage >= 50) grade = 'D';

            return {
                title: assignment?.title || 'Assignment',
                course: course?.title || 'General',
                grade,
                percentage: Math.round(percentage),
                marks: sub.marks,
                total: assignment?.points || 100,
                feedback: sub.feedback
            };
        });

    const myAttendance = [...(attendance || [])]
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    // ── Computed summary stats ──────────────────────────────────────────────────
    const avgPct = myGrades.length > 0
        ? Math.round(myGrades.reduce((acc, g) => acc + g.percentage, 0) / myGrades.length)
        : 0;
    const best  = myGrades.length > 0 ? Math.max(...myGrades.map(g => g.percentage)) : 0;
    const worst = myGrades.length > 0 ? Math.min(...myGrades.map(g => g.percentage)) : 0;
    const gpaLabel = avgPct >= 90 ? 'A+' : avgPct >= 80 ? 'A' : avgPct >= 70 ? 'B' : avgPct >= 60 ? 'C' : avgPct >= 50 ? 'D' : 'F';

    return (
        <div className="animate-in fade-in duration-500 text-left">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden text-left">
                <div className="relative z-10 text-left">
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Performance Summary</h2>
                    <p className="text-slate-500 text-sm mt-1">Review your academic grades and attendance records.</p>
                </div>
            </div>

            {/* Top Stats Banner */}
            {myGrades.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-brand-primary rounded-xl p-5 text-white">
                        <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-2">Overall GPA</p>
                        <p className="text-4xl font-bold">{gpaLabel}</p>
                        <p className="text-[10px] text-white/50 mt-1">{avgPct}% average</p>
                    </div>
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Evaluated</p>
                        <p className="text-4xl font-bold text-slate-800">{myGrades.length}</p>
                        <p className="text-[10px] text-slate-400 mt-1">assignments</p>
                    </div>
                    <div className="bg-green-50 border border-green-100 rounded-xl p-5">
                        <p className="text-[10px] font-bold text-green-600/70 uppercase tracking-widest mb-2">Best Score</p>
                        <p className="text-4xl font-bold text-green-600">{best}%</p>
                        <p className="text-[10px] text-green-500 mt-1">top result</p>
                    </div>
                    <div className="bg-red-50 border border-red-100 rounded-xl p-5">
                        <p className="text-[10px] font-bold text-red-500/70 uppercase tracking-widest mb-2">Lowest Score</p>
                        <p className="text-4xl font-bold text-red-500">{worst}%</p>
                        <p className="text-[10px] text-red-400 mt-1">needs focus</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Grades Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                            <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight italic">Academic Grades</h3>
                            <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-widest shadow-sm">
                                Evaluations: {myGrades.length}
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assessment</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Course</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Score</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Percentage</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Grade</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {myGrades.length > 0 ? myGrades.map((g, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-700 italic group-hover:text-brand-primary transition-colors uppercase tracking-tight">
                                                        {g.title}
                                                    </span>
                                                    {g.feedback && (
                                                        <span className="text-[9px] text-slate-400 mt-1 line-clamp-1 italic">
                                                            " {g.feedback} "
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                                    {g.course}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className="text-xs font-bold text-slate-600">
                                                    {g.marks} <span className="opacity-30">/</span> {g.total}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <div className="flex items-center justify-center gap-3">
                                                    <span className="text-xs font-bold text-slate-700 w-8">{g.percentage}%</span>
                                                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden md:block">
                                                        <div
                                                            className={`h-full opacity-60 rounded-full ${g.percentage >= 70 ? 'bg-green-500' : g.percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                            style={{ width: `${g.percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex justify-center">
                                                    <div className="w-10 h-10 rounded-xl bg-brand-primary/5 border border-brand-primary/10 flex items-center justify-center">
                                                        <span className="text-sm font-bold text-brand-primary">{g.grade}</span>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="py-20 text-center">
                                                <div className="flex flex-col items-center opacity-30">
                                                    <div className="text-4xl mb-3">🎓</div>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No evaluated grades available</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6 text-left">
                    {/* Attendance Card */}
                    <div className="bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-800 text-left">
                        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6">Attendance Log</h3>
                        <div className="space-y-3">
                            {myAttendance.slice(0, 5).length > 0 ? myAttendance.slice(0, 5).map((record, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-slate-800/50 p-4 rounded-xl border border-white/5">
                                    <div className="flex flex-col text-left">
                                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">{record.courseTitle}</span>
                                        <span className="text-[9px] font-medium text-slate-500 mt-0.5">
                                            {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider ${record.status?.toLowerCase() === 'present' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                        {record.status}
                                    </span>
                                </div>
                            )) : (
                                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest text-center py-4">No data found</p>
                            )}
                        </div>
                    </div>

                    {/* Stats Summary */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm text-left">
                        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6">Result Overview</h3>
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="text-2xl font-bold text-slate-800">{myGrades.length}</div>
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Evaluated</div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="text-2xl font-bold text-brand-primary">
                                    {myGrades.length > 0 ? Math.round(myGrades.reduce((acc, curr) => acc + curr.percentage, 0) / myGrades.length) : 0}%
                                </div>
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Average</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentProgress;
