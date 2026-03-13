import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
    const { user } = useAuth();
    const { courses, assignments, submissions, attendance } = useData();

    const userId = user?._id || user?.id;

    const myCourses = (courses || []).filter(c =>
        c.students && c.students.some(sObj => String(sObj?._id || sObj?.id || sObj) === String(userId))
    );
    const myCourseIds = myCourses.map(c => String(c._id || c.id));
    const myAssignments = (assignments || []).filter(a =>
        myCourseIds.includes(String(a.courseId?._id || a.courseId))
    );

    const upcomingTasks = [...myAssignments]
        .filter(a => new Date(a.dueDate) >= new Date())
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 3);

    // Deadline alert: tasks due in ≤ 2 days
    const urgentTasks = upcomingTasks.filter(a => {
        const d = Math.ceil((new Date(a.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
        return d >= 0 && d <= 2;
    });

    // Compute GPA from graded submissions
    const myGrades = (submissions || [])
        .filter(s =>
            String(s.studentId?._id || s.studentId) === String(userId) &&
            s.status === 'graded'
        )
        .map(sub => {
            const asn = assignments.find(a => String(a._id) === String(sub.assignmentId?._id || sub.assignmentId));
            return (sub.marks / (asn?.points || 100)) * 100;
        });

    const avgPct = myGrades.length > 0
        ? Math.round(myGrades.reduce((a, b) => a + b, 0) / myGrades.length)
        : null;

    const getGpaLetter = (pct) => {
        if (pct >= 90) return { label: 'A+', color: 'text-green-600' };
        if (pct >= 80) return { label: 'A',  color: 'text-green-500' };
        if (pct >= 70) return { label: 'B',  color: 'text-blue-600' };
        if (pct >= 60) return { label: 'C',  color: 'text-amber-600' };
        if (pct >= 50) return { label: 'D',  color: 'text-orange-500' };
        return { label: 'F', color: 'text-red-500' };
    };
    const gpa = avgPct !== null ? getGpaLetter(avgPct) : null;

    // Attendance %
    const totalAttendanceRecords = (attendance || []).length;
    const presentCount = (attendance || []).filter(r =>
        r.status?.toLowerCase() === 'present'
    ).length;
    const attendancePct = totalAttendanceRecords > 0
        ? Math.round((presentCount / totalAttendanceRecords) * 100)
        : null;

    return (
        <div className="animate-in fade-in duration-500">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                    Welcome back, {user?.name?.split(' ')[0]} 👋
                </h1>
                <p className="text-slate-500 text-sm mt-1">Check your current progress and upcoming deadlines.</p>
            </div>

            {/* Urgent deadline banner */}
            {urgentTasks.length > 0 && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-4">
                    <div className="w-8 h-8 bg-red-100 text-red-500 rounded-lg flex items-center justify-center flex-shrink-0 text-base">⚡</div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Deadline Alert</p>
                        <p className="text-sm text-red-700 font-medium mt-0.5">
                            {urgentTasks.length === 1
                                ? `"${urgentTasks[0].title}" is due within 2 days!`
                                : `${urgentTasks.length} assignments are due within 2 days!`}
                        </p>
                    </div>
                    <Link to="/student/assignments" className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:underline whitespace-nowrap">
                        View →
                    </Link>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Enrolled Courses */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-lg">📚</div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Courses</h3>
                    </div>
                    <p className="text-3xl font-bold text-slate-800">{myCourses.length}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Currently Enrolled</p>
                </div>

                {/* Attendance */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-lg">📅</div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attendance</h3>
                    </div>
                    {attendancePct !== null ? (
                        <>
                            <p className={`text-3xl font-bold ${attendancePct >= 75 ? 'text-green-600' : 'text-red-500'}`}>
                                {attendancePct}%
                            </p>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
                                <div
                                    className={`h-1.5 rounded-full transition-all ${attendancePct >= 75 ? 'bg-green-400' : 'bg-red-400'}`}
                                    style={{ width: `${attendancePct}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1.5">
                                {presentCount} of {totalAttendanceRecords} classes
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="text-3xl font-bold text-slate-300">—</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">No records yet</p>
                        </>
                    )}
                </div>

                {/* Live GPA */}
                <div className="bg-brand-primary p-6 rounded-xl shadow-lg shadow-brand-primary/10 border border-brand-primary">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-lg">🏆</div>
                        <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider">Your GPA</h3>
                    </div>
                    {gpa ? (
                        <>
                            <p className="text-4xl font-bold text-white tracking-tight">{gpa.label}</p>
                            <p className="text-[10px] text-white/50 font-bold uppercase mt-2">
                                Average: {avgPct}% · {myGrades.length} graded
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="text-2xl font-bold text-white/40 tracking-tight italic uppercase">N/A</p>
                            <p className="text-[10px] text-white/40 font-bold uppercase mt-2">No grades yet</p>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upcoming assignments */}
                <div className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-6 px-2">
                        <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Upcoming Deadlines</h2>
                        <Link to="/student/assignments" className="text-xs font-bold text-brand-primary hover:underline">
                            View All
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {upcomingTasks.length > 0 ? upcomingTasks.map(task => {
                            const daysLeft = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                            const isUrgent = daysLeft <= 2;
                            return (
                                <div
                                    key={task._id}
                                    className={`bg-white p-5 rounded-xl border flex items-center justify-between hover:shadow-md transition-all shadow-sm group ${isUrgent ? 'border-red-200 bg-red-50/30' : 'border-slate-200'}`}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl border ${isUrgent ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
                                            {task.type === 'quiz' ? '⚡' : '📝'}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800 group-hover:text-brand-primary transition-colors">{task.title}</h4>
                                            <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">
                                                {task.courseId?.title || 'Course Material'} · {task.points} pts
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className={`text-[10px] font-bold uppercase ${isUrgent ? 'text-red-500' : 'text-slate-400'}`}>
                                            {daysLeft === 0 ? 'Due Today!' : `${daysLeft} Days Left`}
                                        </p>
                                        <p className="text-[9px] text-slate-300 mt-1">
                                            {new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                        </p>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="bg-slate-50 rounded-2xl p-12 text-center border border-dashed border-slate-200">
                                <div className="text-3xl mb-3">✅</div>
                                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">All caught up!</p>
                                <p className="text-xs text-slate-300 mt-1">No upcoming assignments</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick navigation */}
                <div className="lg:col-span-1 space-y-6">
                    <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight px-2">Quick Access</h2>
                    <div className="space-y-3">
                        <Link to="/student/courses" className="bg-white p-5 rounded-xl border border-slate-200 flex items-center gap-4 hover:shadow-md transition-all shadow-sm">
                            <span className="text-2xl">🎥</span>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-800">Classroom</span>
                                <span className="text-[10px] text-slate-400 font-medium tracking-tight">Access course materials</span>
                            </div>
                        </Link>
                        <Link to="/student/progress" className="bg-white p-5 rounded-xl border border-slate-200 flex items-center gap-4 hover:shadow-md transition-all shadow-sm">
                            <span className="text-2xl">📈</span>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-800">My Grades</span>
                                <span className="text-[10px] text-slate-400 font-medium tracking-tight">Track your performance</span>
                            </div>
                        </Link>
                        <Link to="/student/assignments" className="bg-white p-5 rounded-xl border border-slate-200 flex items-center gap-4 hover:shadow-md transition-all shadow-sm">
                            <span className="text-2xl">📋</span>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-800">Assignments</span>
                                <span className="text-[10px] text-slate-400 font-medium tracking-tight">Submit & track tasks</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
