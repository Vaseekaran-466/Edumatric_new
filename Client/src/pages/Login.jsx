import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    AcademicCapIcon,
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
    const [formData, setFormData] = useState({ email: '', password: '' });

    const handleInputChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
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

                    <div className="mb-6 text-center">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Login</label>
                        <p className="text-xs text-slate-500 font-medium">Enter your own account email and password.</p>
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
