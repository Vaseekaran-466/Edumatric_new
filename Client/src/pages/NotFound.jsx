import { Link } from 'react-router-dom';

const NotFound = () => (
    <div className="min-h-screen bg-brand-background flex items-center justify-center p-6">
        <div className="text-center max-w-md">
            {/* Big 404 */}
            <div className="relative mb-8">
                <p className="text-[140px] font-black text-slate-100 leading-none select-none">404</p>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-brand-accent rounded-[28px] flex items-center justify-center shadow-2xl shadow-brand-accent/30">
                        <span className="text-4xl">🎓</span>
                    </div>
                </div>
            </div>

            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-3">
                Page Not Found
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
                Oops! The page you're looking for doesn't exist or you don't have permission to view it.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                    to="/"
                    className="px-8 py-3.5 bg-brand-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-brand-primary/20 hover:bg-slate-800 transition-all active:scale-95"
                >
                    ← Back to Login
                </Link>
                <button
                    onClick={() => window.history.back()}
                    className="px-8 py-3.5 bg-white text-slate-600 rounded-2xl font-bold text-sm border border-slate-200 shadow-sm hover:bg-slate-50 transition-all active:scale-95"
                >
                    Go Back
                </button>
            </div>

            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-12">
                EduMatrix Platform · Error 404
            </p>
        </div>
    </div>
);

export default NotFound;
