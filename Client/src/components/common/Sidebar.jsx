import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    HomeIcon,
    UsersIcon,
    BookOpenIcon,
    ClipboardDocumentCheckIcon,
    UserGroupIcon,
    AcademicCapIcon,
    ChartBarIcon,
    ArrowLeftOnRectangleIcon,
    CalendarIcon,
    UserIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => {
        // Exact match
        if (location.pathname === path) return true;

        // For nested routes, only match if it's a child route (has a slash after the path)
        // But don't match parent routes (e.g., /student shouldn't match /student/courses)
        if (location.pathname.startsWith(path + '/')) {
            // Make sure this isn't just matching a parent path
            // Only return true if path is not just the base route
            return path.split('/').length > 2; // e.g., /student/courses has 3 parts, /student has 2
        }

        return false;
    };

    const getLinks = () => {
        switch (user?.role) {
            case 'admin':
                return [
                    { name: 'Dashboard', path: '/admin', icon: HomeIcon },
                    { name: 'Users', path: '/admin/users', icon: UsersIcon },
                    { name: 'Courses', path: '/admin/courses', icon: BookOpenIcon },
                    { name: 'My Profile', path: '/admin/profile', icon: UserIcon },
                ];
            case 'teacher':
                return [
                    { name: 'Dashboard', path: '/teacher', icon: HomeIcon },
                    { name: 'Courses', path: '/teacher/courses', icon: AcademicCapIcon },
                    { name: 'Assignments', path: '/teacher/assignments', icon: ClipboardDocumentCheckIcon },
                    { name: 'Attendance', path: '/teacher/attendance', icon: CalendarIcon },
                    { name: 'Students', path: '/teacher/students', icon: UserGroupIcon },
                    { name: 'My Profile', path: '/teacher/profile', icon: UserIcon },
                ];
            case 'student':
                return [
                    { name: 'Dashboard', path: '/student', icon: HomeIcon },
                    { name: 'Courses', path: '/student/courses', icon: AcademicCapIcon },
                    { name: 'Assignments', path: '/student/assignments', icon: ClipboardDocumentCheckIcon },
                    { name: 'Progress', path: '/student/progress', icon: ChartBarIcon },
                    { name: 'My Profile', path: '/student/profile', icon: UserIcon },
                ];
            default:
                return [];
        }
    };

    const links = getLinks();

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 z-20 bg-slate-900/50 backdrop-blur-sm md:hidden"
                    onClick={onClose}
                ></div>
            )}

            <div className={`
                fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 
                transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
                flex flex-col
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex items-center px-6 h-16 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden">
                            <img src="/logo.png" alt="EduMatrix Logo" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xl font-bold text-slate-800 tracking-tight">EduMatrix</span>
                    </div>
                </div>


                <div className="flex-grow py-6 overflow-y-auto px-4 space-y-1">
                    <p className="px-3 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Navigation</p>
                    {links.map((link) => {
                        const Icon = link.icon;
                        const active = isActive(link.path);
                        return (
                            <Link
                                key={link.name}
                                to={link.path}
                                onClick={() => { if (window.innerWidth < 768) onClose(); }}
                                className={`
                                    flex items-center px-3 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200
                                    ${active
                                        ? 'bg-brand-primary/10 text-brand-primary border-l-4 border-brand-primary pl-2'
                                        : 'text-slate-600 hover:bg-brand-primary/5 hover:text-brand-primary border-l-4 border-transparent pl-2'
                                    }
                                `}
                            >
                                <Icon className="h-5 w-5 mr-3" />
                                <span>{link.name}</span>
                            </Link>
                        );
                    })}

                </div>

                <div className="p-4 border-t border-slate-100">
                    <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs uppercase">
                            {user?.name?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{user?.name}</p>
                            <p className="text-[10px] text-slate-500 font-medium capitalize">{user?.role}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Logout"
                        >
                            <ArrowLeftOnRectangleIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
