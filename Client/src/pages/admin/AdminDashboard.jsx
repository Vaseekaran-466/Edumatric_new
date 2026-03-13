import { useData } from '../../context/DataContext';

const AdminDashboard = () => {
    const { stats, users } = useData();

    // Role breakdown
    const admins   = (users || []).filter(u => u.role === 'admin').length;
    const teachers = (users || []).filter(u => u.role === 'teacher').length;
    const students = (users || []).filter(u => u.role === 'student').length;
    const total    = (users || []).length || 1; // prevent /0

    const roleData = [
        { label: 'Students',  count: students, pct: Math.round((students / total) * 100), color: 'bg-brand-primary',    text: 'text-brand-primary'    },
        { label: 'Teachers',  count: teachers, pct: Math.round((teachers / total) * 100), color: 'bg-brand-accent',     text: 'text-brand-accent'     },
        { label: 'Admins',    count: admins,   pct: Math.round((admins   / total) * 100), color: 'bg-slate-400',        text: 'text-slate-500'        },
    ];

    // 5 most recent users (assuming array is chronological; reverse for newest first)
    const recentUsers = [...(users || [])].reverse().slice(0, 5);

    const roleColor = { student: 'bg-blue-100 text-blue-700', teacher: 'bg-purple-100 text-purple-700', admin: 'bg-slate-100 text-slate-600' };

    return (
        <div className="animate-in fade-in duration-500">
            <div className="mb-8 text-left">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Admin Dashboard</h2>
                <p className="text-slate-500 text-sm mt-1">System oversight and user management control panel.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Users',  value: stats?.totalUsers  || (users || []).length, accent: 'text-slate-800',      sublabel: 'Active Members'    },
                    { label: 'Courses',      value: stats?.totalCourses      || 0, accent: 'text-brand-primary',  sublabel: 'Deployed Courses'  },
                    { label: 'Assignments',  value: stats?.totalAssignments  || 0, accent: 'text-green-600',      sublabel: 'Assessment Tasks'  },
                    { label: 'Materials',    value: stats?.totalMaterials    || 0, accent: 'text-orange-600',     sublabel: 'Resource Files'    },
                ].map(card => (
                    <div key={card.label} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">{card.label}</p>
                        <p className={`text-3xl font-bold ${card.accent}`}>{card.value}</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-2 uppercase tracking-wider">{card.sublabel}</p>
                    </div>
                ))}
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Role Distribution */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="mb-6 text-left">
                        <h4 className="text-base font-bold text-slate-800 uppercase tracking-tight">User Role Distribution</h4>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">
                            {total} total registered users
                        </p>
                    </div>

                    <div className="space-y-4">
                        {roleData.map(r => (
                            <div key={r.label}>
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-xs font-bold text-slate-700">{r.label}</span>
                                    <span className="text-xs font-bold text-slate-500">{r.count} · {r.pct}%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2.5">
                                    <div
                                        className={`h-2.5 rounded-full transition-all duration-700 ${r.color}`}
                                        style={{ width: `${r.pct}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Donut-style legend */}
                    <div className="flex gap-6 mt-6 pt-5 border-t border-slate-100">
                        {roleData.map(r => (
                            <div key={r.label} className="flex items-center gap-2">
                                <div className={`w-2.5 h-2.5 rounded-full ${r.color}`} />
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{r.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Users */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm text-left">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h4 className="text-base font-bold text-slate-800 uppercase tracking-tight">Recent Users</h4>
                            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">Latest registrations</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {recentUsers.length > 0 ? recentUsers.map(u => (
                            <div key={u._id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                                <div className="w-9 h-9 rounded-lg bg-brand-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                                    {u.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-800 truncate">{u.name}</p>
                                    <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                                </div>
                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider flex-shrink-0 ${roleColor[u.role] || 'bg-slate-100 text-slate-600'}`}>
                                    {u.role}
                                </span>
                            </div>
                        )) : (
                            <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No users yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
