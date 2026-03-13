import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    UserCircleIcon,
    AcademicCapIcon,
    EnvelopeIcon,
    LockClosedIcon,
    ArrowRightIcon,
    EyeIcon,
    EyeSlashIcon,
    UserIcon
} from '@heroicons/react/24/outline';

const Register = () => {
    const { register } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState('student');
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const roleData = {
        student: {
            id: 'student',
            title: 'Student',
            description: 'Learn and grow',
            icon: UserCircleIcon,
            activeClass: 'border-brand-accent bg-brand-accent/5 ring-1 ring-brand-accent/20'
        },
        teacher: {
            id: 'teacher',
            title: 'Teacher',
            description: 'Share knowledge',
            icon: AcademicCapIcon,
            activeClass: 'border-brand-success bg-brand-success/5 ring-1 ring-brand-success/20'
        }
    };

    const handleInputChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match!");
            return;
        }
        setIsLoading(true);
        setError('');
        const result = await register(
            formData.name,
            formData.email,
            formData.password,
            formData.confirmPassword,
            selectedRole
        );
        if (!result.success) {
            setError(result.message);
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-brand-background flex justify-center items-center p-4">
            <div className="bg-brand-surface border border-slate-100 w-full max-w-[500px] rounded-[32px] shadow-2xl shadow-slate-200 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/5 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-success/5 rounded-full blur-3xl -ml-32 -mb-32" />

                <div className="relative p-8 sm:p-10">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-extrabold text-brand-primary tracking-tight">Create Account</h1>
                        <p className="text-slate-500 mt-2 text-sm font-medium">Join EduMatrix today</p>
                    </div>

                    {/* Role Selection */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        {Object.values(roleData).map((role) => {
                            const Icon = role.icon;
                            const isSelected = selectedRole === role.id;
                            return (
                                <button
                                    key={role.id}
                                    type="button"
                                    onClick={() => setSelectedRole(role.id)}
                                    className={`flex items-center p-3 rounded-xl border transition-all duration-200 text-left ${isSelected
                                        ? role.activeClass
                                        : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-200'
                                        }`}
                                >
                                    <div className={`p-2 rounded-lg mr-3 ${isSelected ? 'bg-white shadow-sm' : 'bg-slate-200/50'}`}>
                                        <Icon className={`w-5 h-5 ${isSelected ? 'text-brand-primary' : 'text-slate-400'}`} />
                                    </div>
                                    <div>
                                        <div className={`text-sm font-bold ${isSelected ? 'text-brand-primary' : 'text-slate-500'}`}>{role.title}</div>
                                        <div className="text-[10px] text-slate-400 font-medium">{role.description}</div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                <UserIcon className="h-5 w-5" />
                            </div>
                            <input
                                type="text" name="name" value={formData.name}
                                onChange={handleInputChange}
                                className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-brand-primary placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-accent/10 focus:border-brand-accent transition-all font-medium text-sm"
                                placeholder="Full Name" required
                            />
                        </div>

                        {/* Email */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                <EnvelopeIcon className="h-5 w-5" />
                            </div>
                            <input
                                type="email" name="email" value={formData.email}
                                onChange={handleInputChange}
                                className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-brand-primary placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-accent/10 focus:border-brand-accent transition-all font-medium text-sm"
                                placeholder="Email Address" required
                            />
                        </div>

                        {/* Password fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <LockClosedIcon className="h-5 w-5" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'} name="password" value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-brand-primary placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-accent/10 focus:border-brand-accent transition-all font-medium text-sm"
                                    placeholder="Password" required
                                />
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <LockClosedIcon className="h-5 w-5" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-brand-primary placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-accent/10 focus:border-brand-accent transition-all font-medium text-sm"
                                    placeholder="Confirm" required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                className="text-xs font-bold text-slate-400 hover:text-brand-accent transition-colors flex items-center gap-1">
                                {showPassword ? <><EyeSlashIcon className="w-3 h-3" /> Hide</> : <><EyeIcon className="w-3 h-3" /> Show</>} Passwords
                            </button>
                        </div>

                        <button
                            type="submit" disabled={isLoading}
                            className="w-full py-4 rounded-xl font-bold transition-all duration-300 shadow-lg bg-brand-primary text-white hover:bg-brand-secondary shadow-brand-primary/25 active:scale-[0.98] mt-2 disabled:opacity-60"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                                    Creating Account...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    Sign Up <ArrowRightIcon className="w-5 h-5" />
                                </div>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-slate-500 font-medium">
                            Already have an account?{' '}
                            <Link to="/" className="text-brand-accent hover:text-brand-accent-hover font-bold hover:underline decoration-2 underline-offset-2 transition-all">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
