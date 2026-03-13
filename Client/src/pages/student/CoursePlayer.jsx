import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import Modal from '../../components/common/Modal';

const CoursePlayer = () => {
    const { courseId } = useParams();
    const { courses, assignments, materials } = useData();
    const numericCourseId = parseInt(courseId);

    const [activeMaterial, setActiveMaterial] = useState(() => {
        if (!materials || materials.length === 0 || !courseId) {
            return null;
        }
        const courseMaterials = materials.filter(m => m.courseId === courseId);
        return courseMaterials.length > 0 ? courseMaterials[0] : null;
    });

    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const course = courses.find(c => c._id === courseId);
    const courseAssignments = assignments ? assignments.filter(a => a.courseId === courseId) : [];
    const allCourseMaterials = materials ? materials.filter(m => m.courseId === courseId) : [];
    const filteredMaterials = allCourseMaterials.filter(m =>
        m.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!course) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <h2 className="text-xl font-bold text-slate-800">Module Not Found</h2>
                <Link to="/student/courses" className="mt-6 bg-brand-primary text-white px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm">
                    Back to Catalog
                </Link>
            </div>
        );
    }

    const isVideo = (filename) => {
        if (!filename) return false;
        const validExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
        return validExtensions.some(ext => filename.toLowerCase().endsWith(ext));
    };

    return (
        <div className="animate-in fade-in duration-500 text-left">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 text-left">
                <div className="text-left">
                    <Link to="/student/courses" className="text-brand-accent hover:underline text-xs font-bold flex items-center gap-2 mb-3 tracking-wider uppercase">
                        <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
                        Back to Library
                    </Link>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight uppercase italic">{course.title}</h2>
                    <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-wider">{course.instructor} • {allCourseMaterials.length} Modules</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-sm aspect-video relative flex items-center justify-center border-4 border-slate-800">
                        {activeMaterial ? (
                            isVideo(activeMaterial.fileName) ? (
                                <video
                                    key={activeMaterial._id}
                                    controls
                                    className="w-full h-full object-contain"
                                    src={activeMaterial.url || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
                                />
                            ) : (
                                <div className="w-full h-full bg-white flex flex-col">
                                    <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between bg-white">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-bold text-brand-accent uppercase tracking-widest">{activeMaterial.fileName}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => setIsPreviewOpen(true)} className="p-2 text-slate-400 hover:text-brand-primary rounded-lg transition-colors">
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-slate-50 p-6">
                                        {activeMaterial.url ? (
                                            <iframe src={activeMaterial.url} className="w-full h-full rounded-xl shadow-sm bg-white" title="Doc" />
                                        ) : (
                                            <div className="h-full bg-white rounded-xl shadow-sm p-10 text-left border border-slate-100">
                                                <h1 className="text-xl font-bold text-slate-800 mb-4">{activeMaterial.title}</h1>
                                                <div className="space-y-4 text-slate-500 text-sm font-medium">
                                                    <p>This is a study resource for the "{course.title}" program. Please review the contents carefully and use the materials provided for your assignments.</p>
                                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Key Notes</p>
                                                        <ul className="list-disc list-inside space-y-1">
                                                            <li>Fundamental theories addressed in the chapter.</li>
                                                            <li>Practical applications in real-world scenarios.</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        ) : (
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Select a lesson to begin</p>
                        )}
                    </div>

                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-left">
                        <h3 className="text-lg font-bold text-slate-800 mb-2 uppercase tracking-tight">{activeMaterial?.title || 'Program Overview'}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed font-medium">
                            {activeMaterial?.type === 'video' ? 'Interactive video module' : 'Academic study document'} for <span className="text-brand-accent font-bold">"{course.title}"</span>. Follow the curriculum sequence for better retention.
                        </p>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6 text-left">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[500px]">
                        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Curriculum Sequence</h3>
                        </div>
                        <div className="overflow-y-auto custom-scrollbar p-3 space-y-1">
                            {filteredMaterials.map((material, idx) => {
                                const isActive = activeMaterial?._id === material._id;
                                return (
                                    <button
                                        key={material._id}
                                        onClick={() => setActiveMaterial(material)}
                                        className={`w-full p-4 flex items-center gap-4 text-left rounded-xl transition-all ${isActive ? 'bg-brand-primary text-white shadow-sm' : 'hover:bg-slate-50'}`}
                                    >
                                        <span className={`text-[10px] font-bold ${isActive ? 'text-white/60' : 'text-slate-300'}`}>{(idx + 1).toString().padStart(2, '0')}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-700'}`}>{material.title}</div>
                                            <div className={`text-[9px] font-bold uppercase mt-1 tracking-widest ${isActive ? 'text-white/70' : 'text-slate-400'}`}>{material.type}</div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Resources Widget */}
                    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-sm text-left">
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Required Tasks</h4>
                        <div className="space-y-3">
                            {courseAssignments.length > 0 ? (
                                courseAssignments.map(a => (
                                    <Link key={a._id} to="/student/assignments" className="block p-4 bg-slate-800 rounded-xl hover:bg-slate-800/80 transition-all border border-slate-700/50">
                                        <div className="text-xs font-bold text-white mb-1 uppercase tracking-tight truncate">{a.title}</div>
                                        <div className="text-[9px] text-brand-accent font-bold uppercase tracking-widest">DUE: {a.dueDate}</div>
                                    </Link>
                                ))
                            ) : (
                                <div className="text-center py-4 border border-dashed border-slate-800 rounded-xl">
                                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">No active tasks</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="Resource Summary">
                <div className="p-2 space-y-6 text-left">
                    <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl">
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Module Checklist</h4>
                        <ul className="space-y-2 text-xs font-bold text-slate-600 uppercase tracking-tight">
                            <li className="flex items-center gap-2">✔ Lesson Overview</li>
                            <li className="flex items-center gap-2">✔ Case Study Analysis</li>
                            <li className="flex items-center gap-2">✔ Knowledge Verification</li>
                        </ul>
                    </div>
                    <p className="text-sm font-medium text-slate-500 leading-relaxed italic">
                        Use this guide to support your learning process. Ensure you take notes on the critical theories presented here.
                    </p>
                </div>
            </Modal>
        </div>
    );
};

export default CoursePlayer;
