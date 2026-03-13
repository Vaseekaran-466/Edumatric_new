import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
    UserIcon,
    EnvelopeIcon,
    AcademicCapIcon,
    IdentificationIcon,
    KeyIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';

const Profile = () => {
    const { user: authUser } = useAuth();
    const { updateMe } = useData();
    const [formData, setFormData] = useState({
        name: authUser?.name || '',
        email: authUser?.email || '',
        department: authUser?.department || '',
        rollNo: authUser?.rollNo || '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        const result = await updateMe(formData);
        if (result.success) {
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
        } else {
            setMessage({ type: 'error', text: result.message });
        }
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header section with glass effect */}
            <div className="relative mb-8 rounded-3xl overflow-hidden bg-gradient-to-r from-brand-primary to-slate-800 p-8 text-white shadow-xl shadow-brand-primary/20">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 text-left">
                    <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl font-bold border border-white/30 shadow-inner">
                        {authUser?.name?.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{authUser?.name}</h1>
                        <p className="text-white/70 font-medium capitalize mt-1 flex items-center gap-2">
                            <ShieldCheckIcon className="w-4 h-4" />
                            {authUser?.role} Account
                        </p>
                    </div>
                </div>
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-accent/20 rounded-full blur-2xl -ml-16 -mb-16"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Account Status</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-500">Verified</span>
                                <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[10px] font-bold uppercase">Yes</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-500">Tier</span>
                                <span className="px-2 py-0.5 rounded-full bg-brand-primary/5 text-brand-primary text-[10px] font-bold uppercase">Premium</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
                        <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4 relative z-10">Security Tip</h3>
                        <p className="text-sm text-white/80 relative z-10 italic">"Use a unique password to keep your academic records safe. Never share your credentials."</p>
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
                    </div>
                </div>

                {/* Main Form */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                        <div className="p-8 space-y-8">
                            {message.text && (
                                <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-3 animate-in fade-in zoom-in duration-300 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                                    }`}>
                                    <div className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    {message.text}
                                </div>
                            )}

                            {/* Section: Basic Info */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <UserIcon className="w-5 h-5 text-brand-primary" />
                                    <h2 className="text-lg font-bold text-slate-800 tracking-tight">Personal Information</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:ring-4 focus:ring-brand-primary/5 focus:bg-white transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:ring-4 focus:ring-brand-primary/5 focus:bg-white transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section: Academic Info (Conditional) */}
                            {authUser?.role === 'student' && (
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AcademicCapIcon className="w-5 h-5 text-brand-primary" />
                                        <h2 className="text-lg font-bold text-slate-800 tracking-tight">Academic Details</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Department</label>
                                            <input
                                                type="text"
                                                name="department"
                                                value={formData.department}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:ring-4 focus:ring-brand-primary/5 focus:bg-white transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Roll Number</label>
                                            <input
                                                type="text"
                                                name="rollNo"
                                                value={formData.rollNo}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:ring-4 focus:ring-brand-primary/5 focus:bg-white transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Section: Password Update */}
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <KeyIcon className="w-5 h-5 text-brand-primary" />
                                    <h2 className="text-lg font-bold text-slate-800 tracking-tight">Change Password</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">New Password</label>
                                        <input
                                            type="password"
                                            name="password"
                                            placeholder="Leave blank to keep current"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:ring-4 focus:ring-brand-primary/5 focus:bg-white transition-all outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Confirm New Password</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:ring-4 focus:ring-brand-primary/5 focus:bg-white transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                            <p className="text-[11px] text-slate-400 font-medium max-w-xs text-left">
                                Note: You will be asked to re-login if you change your primary email or password.
                            </p>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`
                                    min-w-[200px] px-8 py-3 bg-brand-primary text-white rounded-xl text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-brand-primary/20 
                                    hover:bg-slate-800 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50
                                    ${loading ? 'animate-pulse' : ''}
                                `}
                            >
                                {loading ? 'Saving Changes...' : 'Update Account Data'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
