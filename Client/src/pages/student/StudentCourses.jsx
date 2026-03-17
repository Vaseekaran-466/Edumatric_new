import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';

const StudentCourses = () => {
    const { courses, materials, assignments, submissions, user } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [viewMode, setViewMode] = useState('grid');

    const processedCourses = courses
        .filter(course => {
            const matchesSearch = course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.instructor?.toLowerCase().includes(searchQuery.toLowerCase());

            // Simple logic for progress grouping (can be refined later)
            if (activeTab === 'completed') return matchesSearch && course.title?.length % 2 === 0;
            if (activeTab === 'in-progress') return matchesSearch && course.title?.length % 2 !== 0;
            return matchesSearch;
        })
        .sort((a, b) => {
            if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

    return (
        <div className="animate-in fade-in duration-500">
            {/* Professional Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden text-left">
                <div className="relative z-10 text-left">
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">My Learning Programs</h2>
                    <p className="text-slate-500 text-sm mt-1">Access and manage your enrolled courses</p>
                </div>

                <div className="flex items-center gap-4 relative z-10">
                    <div className="bg-slate-50 px-6 py-3 rounded-xl border border-slate-100 text-center min-w-[100px]">
                        <div className="text-2xl font-bold text-slate-800">{processedCourses.length}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Enrolled</div>
                    </div>
                    <button
                        onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                        className="p-3 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 border border-slate-200 transition-all"
                        title={viewMode === 'grid' ? 'Switch to List View' : 'Switch to Grid View'}
                    >
                        {viewMode === 'grid' ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Controls Section */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-8 flex flex-col lg:flex-row gap-4 items-center">
                <div className="flex bg-slate-100 p-1 rounded-xl w-full lg:w-auto">
                    {['all', 'in-progress', 'completed'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-brand-primary'}`}
                        >
                            {tab.replace('-', ' ')}
                        </button>
                    ))}
                </div>

                <div className="flex flex-1 gap-4 w-full">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-4 focus:ring-brand-accent/5 focus:border-brand-accent outline-none transition-all"
                        />
                        <svg className="h-4 w-4 text-slate-300 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider outline-none focus:bg-white cursor-pointer appearance-none pr-10"
                    >
                        <option value="newest">Newest First</option>
                        <option value="title">Alphabetical</option>
                    </select>
                </div>
            </div>

            {/* Courses Display */}
            {processedCourses.length > 0 ? (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
                        {processedCourses.map((course) => {
                            const courseMaterials = materials.filter(m => m.courseId === course._id);
                            
                            // Dynamic progress calculation
                            const courseAssignments = assignments.filter(a => String(a.courseId?._id || a.courseId) === String(course._id));
                            const submittedCount = courseAssignments.filter(a => 
                                submissions.some(s => 
                                    String(s.assignmentId?._id || s.assignmentId) === String(a._id) && 
                                    String(s.studentId?._id || s.studentId?.id || s.studentId) === String(user?._id || user?.id)
                                )
                            ).length;
                            
                            const progress = courseAssignments.length > 0 
                                ? Math.round((submittedCount / courseAssignments.length) * 100) 
                                : 0;

                            return (
                                <div
                                    key={course._id}
                                    className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-brand-accent/30 hover:shadow-md transition-all text-left"
                                >
                                    {/* Course Header */}
                                    <div className="h-48 bg-slate-900 relative overflow-hidden flex items-center justify-center">
                                        <span className="text-white text-8xl font-bold opacity-10 select-none">{course.title.charAt(0)}</span>
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-white/10 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-white/20">
                                                {courseMaterials.length} Lessons
                                            </span>
                                        </div>
                                        <div className="absolute bottom-4 right-4 bg-brand-primary text-white text-[9px] font-bold px-3 py-1.5 rounded-lg">
                                            {progress}% Complete
                                        </div>
                                    </div>

                                    {/* Course Content */}
                                    <div className="p-6 flex-1 flex flex-col text-left">
                                        <h3 className="text-lg font-bold text-slate-800 leading-tight mb-2 uppercase tracking-tight">
                                            {course.title}
                                        </h3>
                                        <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 font-medium mb-6">
                                            {course.description}
                                        </p>

                                        <div className="mt-auto">
                                            {/* Progress Bar */}
                                            <div className="mb-6">
                                                <div className="flex justify-between items-end mb-2">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress</span>
                                                    <span className="text-xs font-bold text-slate-600">{progress}%</span>
                                                </div>
                                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-brand-primary rounded-full transition-all duration-500"
                                                        style={{ width: `${progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            {/* Footer */}
                                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 bg-slate-100 rounded-lg flex items-center justify-center text-brand-primary font-bold text-sm">
                                                        {course.instructor.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Instructor</span>
                                                        <span className="text-xs text-slate-700 font-bold">{course.instructor}</span>
                                                    </div>
                                                </div>

                                                <Link
                                                    to={`/student/courses/${course._id}`}
                                                    className="bg-white text-slate-800 border-2 border-slate-800 px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all shadow-sm"
                                                >
                                                    Continue
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* Professional Table View */
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Course</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Instructor</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Progress</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Lessons</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {processedCourses.map((course) => {
                                    const courseMaterials = materials.filter(m => m.courseId === course._id);
                                    
                                    // Dynamic progress calculation
                                    const courseAssignments = assignments.filter(a => String(a.courseId?._id || a.courseId) === String(course._id));
                                    const submittedCount = courseAssignments.filter(a => 
                                        submissions.some(s => 
                                            String(s.assignmentId?._id || s.assignmentId) === String(a._id) && 
                                            String(s.studentId?._id || s.studentId?.id || s.studentId) === String(user?._id || user?.id)
                                        )
                                    ).length;
                                    
                                    const progress = courseAssignments.length > 0 
                                        ? Math.round((submittedCount / courseAssignments.length) * 100) 
                                        : 0;

                                    return (
                                        <tr key={course._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-slate-900 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-lg font-bold">
                                                        {course.title.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-slate-800 uppercase tracking-tight">{course.title}</span>
                                                        <span className="text-[10px] text-slate-400 font-semibold mt-0.5 line-clamp-1">{course.description}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className="text-xs font-bold text-slate-600">{course.instructor}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="text-xs font-bold text-slate-600">{progress}%</div>
                                                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-brand-primary rounded-full"
                                                            style={{ width: `${progress}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold">
                                                    {courseMaterials.length}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <Link
                                                    to={`/student/courses/${course._id}`}
                                                    className="px-5 py-2 bg-white text-slate-800 border-2 border-slate-800 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all inline-block shadow-sm"
                                                >
                                                    Continue
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )
            ) : (
                <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-slate-200">
                    <div className="text-4xl mb-4 opacity-20">📚</div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No courses found</p>
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="mt-4 text-xs font-bold text-brand-primary hover:underline"
                        >
                            Clear search
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default StudentCourses;
