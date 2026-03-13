import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
    Bars3Icon,
    BellIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { useLocation } from 'react-router-dom';

const Navbar = ({ onMenuClick }) => {
    const { user } = useAuth();
    const { submissions, assignments, users } = useData();
    const location = useLocation();
    const [showNotifications, setShowNotifications] = useState(false);
    const bellRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (bellRef.current && !bellRef.current.contains(e.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes('users')) return 'User Management';
        if (path.includes('courses')) return 'Courses';
        if (path.includes('assignments')) return 'Assignments';
        if (path.includes('attendance')) return 'Attendance';
        if (path.includes('students')) return 'Students';
        if (path.includes('progress')) return 'Performance';
        if (path.includes('profile')) return 'My Profile';
        return 'Overview';
    };

    // ── Build role-specific notifications ──────────────────────────────────────
    const buildNotifications = () => {
        const notes = [];

        if (user?.role === 'student') {
            // Upcoming assignments due within 3 days
            const userId = user?._id || user?.id;
            const myAssignmentIds = (assignments || []).map(a => String(a._id));
            const mySubmittedIds = (submissions || [])
                .filter(s => String(s.studentId?._id || s.studentId) === String(userId))
                .map(s => String(s.assignmentId?._id || s.assignmentId));

            (assignments || []).forEach(a => {
                const daysLeft = Math.ceil((new Date(a.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                if (daysLeft >= 0 && daysLeft <= 3 && !mySubmittedIds.includes(String(a._id))) {
                    notes.push({
                        type: 'warning',
                        title: `Due Soon: ${a.title}`,
                        body: daysLeft === 0 ? 'Due today!' : `${daysLeft} day${daysLeft > 1 ? 's' : ''} remaining`,
                        time: a.dueDate
                    });
                }
            });

            // Recently graded
            (submissions || [])
                .filter(s => String(s.studentId?._id || s.studentId) === String(userId) && s.status === 'graded')
                .slice(0, 2)
                .forEach(s => {
                    const asn = assignments.find(a => String(a._id) === String(s.assignmentId?._id || s.assignmentId));
                    notes.push({
                        type: 'success',
                        title: `Graded: ${asn?.title || 'Assignment'}`,
                        body: `Score: ${s.marks} / ${asn?.points || 100} pts`,
                        time: s.gradedAt || s.date
                    });
                });
        }

        if (user?.role === 'teacher') {
            const pendingCount = (submissions || []).filter(s => s.status === 'pending').length;
            if (pendingCount > 0) {
                notes.push({
                    type: 'alert',
                    title: `${pendingCount} Submission${pendingCount > 1 ? 's' : ''} Awaiting Grading`,
                    body: 'Students are waiting for feedback',
                    time: null
                });
            }
            // Assignments due within 2 days
            (assignments || []).filter(a => {
                const d = Math.ceil((new Date(a.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                return d >= 0 && d <= 2;
            }).slice(0, 2).forEach(a => {
                notes.push({
                    type: 'warning',
                    title: `Closing: ${a.title}`,
                    body: 'Assignment deadline approaching',
                    time: a.dueDate
                });
            });
        }

        if (user?.role === 'admin') {
            const recentUsers = [...(users || [])]
                .slice(-3)
                .reverse();
            recentUsers.forEach(u => {
                notes.push({
                    type: 'info',
                    title: `New User: ${u.name}`,
                    body: `Role: ${u.role}`,
                    time: u.createdAt
                });
            });
        }

        return notes;
    };

    const notifications = buildNotifications();
    const hasAlerts = notifications.length > 0;

    const typeStyles = {
        warning: { dot: 'bg-amber-400', bg: 'bg-amber-50 border-amber-100', text: 'text-amber-700' },
        success: { dot: 'bg-green-400', bg: 'bg-green-50 border-green-100', text: 'text-green-700' },
        alert:   { dot: 'bg-red-400',   bg: 'bg-red-50 border-red-100',   text: 'text-red-700' },
        info:    { dot: 'bg-blue-400',   bg: 'bg-blue-50 border-blue-100', text: 'text-blue-700' },
    };

    return (
        <div className="flex items-center justify-between h-16 bg-white border-b border-slate-200 px-6 sticky top-0 z-20">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 rounded-lg md:hidden text-slate-500 hover:bg-slate-100 transition-colors"
                >
                    <Bars3Icon className="h-5 w-5" />
                </button>

                <div className="hidden md:block">
                    <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                        {getPageTitle()}
                    </h2>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Notification Bell */}
                <div className="relative" ref={bellRef}>
                    <button
                        onClick={() => setShowNotifications(v => !v)}
                        className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors relative"
                        title="Notifications"
                    >
                        <BellIcon className="h-5 w-5" />
                        {hasAlerts && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        )}
                    </button>

                    {/* Dropdown Panel */}
                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/60 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
                                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wider">
                                        {notifications.length} alert{notifications.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowNotifications(false)}
                                    className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                                >
                                    <XMarkIcon className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                                {notifications.length > 0 ? notifications.map((n, i) => {
                                    const st = typeStyles[n.type] || typeStyles.info;
                                    return (
                                        <div key={i} className={`flex items-start gap-3 px-5 py-4 ${st.bg} border-l-0`}>
                                            <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${st.dot}`} />
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-xs font-bold ${st.text} leading-tight`}>{n.title}</p>
                                                <p className="text-[11px] text-slate-500 mt-0.5">{n.body}</p>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="py-10 text-center">
                                        <div className="text-2xl mb-2">🔔</div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">All caught up!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-6 w-px bg-slate-200 hidden sm:block" />

                <div className="flex items-center gap-3">
                    <div className="text-right hidden xl:block">
                        <div className="text-sm font-bold text-slate-800 leading-none">{user?.name}</div>
                        <div className="text-[11px] text-slate-400 font-semibold mt-1 capitalize">{user?.role}</div>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-brand-primary text-white flex items-center justify-center font-bold text-sm shadow-sm">
                        {user?.name?.charAt(0)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
