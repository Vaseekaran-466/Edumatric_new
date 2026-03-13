import { useState } from 'react';
import { useData } from '../../context/DataContext';
import Modal from '../../components/common/Modal';

const TeacherCourseContent = () => {
    const { courses, materials, addMaterial, deleteMaterial } = useData();
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [materialTitle, setMaterialTitle] = useState('');
    const [materialType, setMaterialType] = useState('document');
    const [selectedFile, setSelectedFile] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddMaterial = (e) => {
        e.preventDefault();
        if (!selectedCourse) return;

        if (selectedFile) {
            if (selectedFile.size > 2 * 1024 * 1024) {
                alert('File size exceeds 2MB limit.');
                return;
            }

            const reader = new FileReader();
            reader.onload = async (event) => {
                const newMaterial = {
                    courseId: selectedCourse._id, // Use _id from MongoDB
                    title: materialTitle || selectedFile.name.split('.')[0],
                    fileName: selectedFile.name,
                    url: event.target.result, // Mapping base64 content to 'url' field for backend
                    type: materialType,
                    fileType: selectedFile.type
                };

                const result = await addMaterial(newMaterial);
                if (result.success) {
                    setIsModalOpen(false);
                    setMaterialTitle('');
                    setSelectedFile(null);
                }
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleDeleteMaterial = (id) => {
        if (window.confirm('Are you sure you want to delete this material?')) {
            deleteMaterial(id);
        }
    };

    return (
        <div className="animate-in fade-in duration-500">
            {/* Professional Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="relative z-10 text-left">
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Lesson Materials</h2>
                    <p className="text-slate-500 text-sm mt-1">Upload and organize academic resources for your students.</p>
                </div>

                <div className="relative z-10 w-full md:w-80">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Find course..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-4 focus:ring-brand-accent/5 transition-all outline-none"
                        />
                        <svg className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredCourses.map(course => (
                    <div key={course._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:border-brand-accent/20 transition-all">
                        <div className="p-6 flex-1">
                            <div className="flex justify-between items-start mb-6">
                                <div className="max-w-[80%] text-left">
                                    <h3 className="text-lg font-bold text-slate-800 tracking-tight leading-tight uppercase italic">{course.title}</h3>
                                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{course.students?.length || 0} Members</p>
                                </div>
                                <button
                                    onClick={() => { setSelectedCourse(course); setIsModalOpen(true); }}
                                    className="p-2 bg-brand-primary text-white rounded-lg hover:bg-slate-800 transition-all flex items-center justify-center shadow-sm"
                                    title="Add Resource"
                                >
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Module Contents</span>
                                    <div className="flex-1 h-px bg-slate-100"></div>
                                </div>

                                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                    {materials && materials.filter(m => m.courseId === course._id).length > 0 ? (
                                        materials.filter(m => m.courseId === course._id).map(material => (
                                            <div key={material._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group/item hover:bg-white border border-transparent hover:border-slate-100 transition-all shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${material.type === 'video' ? 'bg-amber-50 text-amber-500' : 'bg-brand-accent/10 text-brand-accent'}`}>
                                                        {material.type === 'video' ? '🎬' : '📄'}
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="text-xs font-bold text-slate-700 truncate max-w-[140px]">{material.title}</div>
                                                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{material.type}</div>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleDeleteMaterial(material._id)} className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">No materials uploaded</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedCourse(null); setMaterialTitle(''); setSelectedFile(null); }}
                title="Upload Resource"
            >
                <form onSubmit={handleAddMaterial} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Title</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-brand-accent/5 transition-all"
                            value={materialTitle}
                            onChange={(e) => setMaterialTitle(e.target.value)}
                            placeholder="Material Name"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Format</label>
                            <select
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 outline-none appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiPjxwYXRoIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIyIiBkPSJNMTkgOWwtNyA3LTctNyIvPjwvc3ZnPg==')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat"
                                value={materialType}
                                onChange={(e) => setMaterialType(e.target.value)}
                            >
                                <option value="document">PDF</option>
                                <option value="video">MP4</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">File</label>
                            <div className="relative">
                                <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full" />
                                <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-400 truncate flex items-center gap-2">
                                    <span>{selectedFile ? selectedFile.name : 'Select...'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="w-full py-4 bg-brand-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm">
                        Process Upload
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default TeacherCourseContent;
