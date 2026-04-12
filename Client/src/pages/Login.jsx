import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    UserCircleIcon,
    AcademicCapIcon,
    ShieldCheckIcon,
    EyeIcon,
    EyeSlashIcon,
    EnvelopeIcon,
    LockClosedIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';

const Login = () => {
    const { login, loading: authLoading } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedRole, setSelectedRole] = useState('student');
    const [formData, setFormData] = useState({ email: '', password: '' });

    const demoAccounts = [
        {
            id: 'student',
            label: 'Student',
            icon: UserCircleIcon,
            email: 'student1@edu.com',
            password: 'EduDemo@123',
            accent: 'border-brand-accent bg-brand-accent/5 ring-1 ring-brand-accent/20',
        },
        {
            id: 'teacher',
            label: 'Teacher',
            icon: AcademicCapIcon,
            email: 'teacher@edu.com',
            password: 'EduDemo@123',
            accent: 'border-brand-success bg-brand-success/5 ring-1 ring-brand-success/20',
        },
        {
            id: 'admin',
            label: 'Admin',
            icon: ShieldCheckIcon,
            email: 'admin@edu.com',
            password: 'EduDemo@123',
            accent: 'border-slate-800 bg-slate-900/5 ring-1 ring-slate-800/10',
        },
    ];

    const handleInputChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const applyDemoAccount = (account) => {
        setSelectedRole(account.id);
        setFormData({
            email: account.email,
            password: account.password,
        });
        setError('');
    };

    const handleForgotPass = (e) => {
        e.preventDefault();
        setError('Password recovery is not configured yet. Contact the administrator.');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            setError('Please enter both email and password.');
            return;
        }
        setIsLoading(true);
        setError('');
        const result = await login(formData.email, formData.password);
        if (!result.success) {
            setError(result.message);
        }
        setIsLoading(false);
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-brand-background flex justify-center items-center">
                <div className="w-10 h-10 border-4 border-brand-accent border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-background flex justify-center items-center p-4">
            <div className="bg-brand-surface border border-slate-100 w-full max-w-[440px] rounded-[32px] shadow-2xl shadow-slate-200 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/5 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-success/5 rounded-full blur-3xl -ml-32 -mb-32" />

                <div className="relative p-8 sm:p-12">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-brand-accent rounded-[24px] shadow-xl shadow-brand-accent/20">
                            <AcademicCapIcon className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-4xl font-extrabold text-brand-primary tracking-tight">EduMatrix</h1>
                        <p className="text-slate-500 mt-2 text-sm font-medium">Professional Learning Ecosystem</p>
                    </div>

                    <div className="mb-6">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">Role Based Login</label>
                        <div className="grid grid-cols-3 gap-3">
                            {demoAccounts.map((account) => {
                                const Icon = account.icon;
                                const isSelected = selectedRole === account.id;

                                return (
                                    <button
                                        key={account.id}
                                        type="button"
                                        onClick={() => applyDemoAccount(account)}
                                        className={`flex flex-col items-center p-3 rounded-2xl border transition-all duration-300 ${isSelected
                                            ? account.accent
                                            : 'border-slate-100 bg-slate-50 hover:bg-slate-100'
                                            }`}
                                    >
                                        <div className={`p-2 rounded-xl mb-2 transition-all ${isSelected ? 'bg-white text-brand-primary shadow-md' : 'bg-white shadow-sm text-slate-400'}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-brand-primary' : 'text-slate-400'}`}>
                                            {account.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                        <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3 text-center">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Demo Login</p>
                            <p className="mt-1 text-xs font-medium text-slate-500">
                                Select a role above to fill demo credentials, or enter your own account manually.
                            </p>
                            <p className="mt-2 text-[11px] font-bold text-slate-700">
                                Demo password: <span className="text-brand-accent">EduDemo@123</span>
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold animate-pulse">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                        <div className="space-y-4">
                            <div className="relative group">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-accent transition-colors">
                                        <EnvelopeIcon className="h-5 w-5" />
                                    </div>
                                    <input
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-brand-primary placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-accent/10 focus:border-brand-accent transition-all font-medium"
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Enter your email"
                                        autoComplete="off"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="relative group">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-accent transition-colors">
                                        <LockClosedIcon className="h-5 w-5" />
                                    </div>
                                    <input
                                        className="w-full pl-12 pr-12 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-brand-primary placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-accent/10 focus:border-brand-accent transition-all font-medium"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Enter your password"
                                        autoComplete="new-password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-brand-accent transition-colors"
                                    >
                                        {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="remember" className="w-4 h-4 text-brand-accent border-slate-200 rounded focus:ring-brand-accent" />
                                <label htmlFor="remember" className="text-xs font-bold text-slate-500 cursor-pointer">Remember me</label>
                            </div>
                            <a href="#" onClick={handleForgotPass} className="text-xs font-bold text-brand-accent hover:underline decoration-2 underline-offset-2">Recover Password?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-5 rounded-2xl font-bold transition-all duration-300 shadow-xl bg-brand-accent text-white hover:bg-brand-accent-hover shadow-brand-accent/25 active:scale-[0.98] disabled:opacity-60"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                                    Logging in...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    Sign In to Dashboard
                                    <ArrowRightIcon className="w-5 h-5" />
                                </div>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-slate-500 font-medium font-bold">
                            New user? <Link to="/register" className="text-brand-accent hover:text-brand-accent-hover underline decoration-2 underline-offset-2">Create Account</Link>
                        </p>
                    </div>

                    <div className="mt-8 text-center border-t border-slate-50 pt-6">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic opacity-60">EduMatrix Secure Platform v4.1.0</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
