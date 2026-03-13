import { useState, useEffect, useRef } from 'react';
import { useData } from '../../context/DataContext';

const TeacherAttendance = () => {
    const { courses, users, markAttendance, attendance, getAttendanceByCourse } = useData();
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [localRecords, setLocalRecords] = useState([]); // [{ studentId, status }]
    const lastViewRef = useRef({ courseId: '', date: '' });

    // Filter students: only those enrolled in the selected course
    const selectedCourse = courses.find(c => String(c._id) === String(selectedCourseId));
    const students = users.filter(u =>
        u.role === 'student' &&
        selectedCourse?.students?.some(s => String(s._id || s) === String(u._id))
    );

    // Load existing records when course or date changes
    useEffect(() => {
        if (selectedCourseId) {
            getAttendanceByCourse(selectedCourseId);
        }
    }, [selectedCourseId, getAttendanceByCourse]);

    useEffect(() => {
        if (!selectedCourseId) return;

        const dateStr = new Date(attendanceDate).toISOString().split('T')[0];
        const currentViewKey = `${selectedCourseId}-${dateStr}`;
        const lastViewKey = `${lastViewRef.current.courseId}-${lastViewRef.current.date}`;

        // Find server record
        const existingRecord = attendance.find(a =>
            String(a.courseId) === String(selectedCourseId) &&
            new Date(a.date).toISOString().split('T')[0] === dateStr
        );

        // CASE 1: The user actually switched course or date -> ALWAYS re-sync from server/fresh
        if (currentViewKey !== lastViewKey) {
            if (existingRecord) {
                setLocalRecords(existingRecord.records.map(r => ({
                    studentId: r.studentId?._id || r.studentId,
                    status: r.status
                })));
            } else {
                setLocalRecords(students.map(s => ({ studentId: s._id, status: null })));
            }
            lastViewRef.current = { courseId: selectedCourseId, date: dateStr };
            return;
        }

        // CASE 2: Global attendance updated but user is on the same view -> Only sync if user hasn't started marking yet
        const hasLocalChanges = localRecords.some(r => r.status !== null);
        if (existingRecord && !hasLocalChanges) {
             setLocalRecords(existingRecord.records.map(r => ({
                studentId: r.studentId?._id || r.studentId,
                status: r.status
            })));
        }
    }, [attendance, attendanceDate, selectedCourseId, students.length, localRecords.length]);

    const handleSetStatus = (studentId, status) => {
        setLocalRecords(prev => prev.map(r => {
            if (String(r.studentId) === String(studentId)) {
                return { ...r, status };
            }
            return r;
        }));
    };

    const getStatus = (studentId) => {
        const record = localRecords.find(r => String(r.studentId) === String(studentId));
        return record ? record.status : null;
    };

    const handleSave = async () => {
        if (!selectedCourseId) {
            alert('Please select a course first.');
            return;
        }

        const unmarked = localRecords.some(r => !r.status);
        if (unmarked) {
            alert('Please mark attendance for all students before saving.');
            return;
        }
        
        const result = await markAttendance(selectedCourseId, attendanceDate, localRecords);
        if (result.success) {
            alert('Attendance saved successfully!');
        } else {
            alert(result.message);
        }
    };

    const exportToCSV = () => {
        if (!selectedCourseId || !students.length) return;

        // Create CSV Header
        const headers = ['Student Name', 'Email', 'Roll No', 'Department', 'Attendance Status'];
        
        // Create CSV Rows
        const rows = students.map(student => {
            const status = getStatus(student._id);
            const statusText = status === 'present' ? 'Present' : status === 'absent' ? 'Absent' : 'Not Marked';
            
            // Escape fields that might contain commas
            const escapeField = (field) => `"${String(field || '').replace(/"/g, '""')}"`;

            return [
                escapeField(student.name),
                escapeField(student.email),
                escapeField(student.rollNo || 'N/A'),
                escapeField(student.department || 'General'),
                escapeField(statusText)
            ].join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');
        
        // Create Blob and download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        // Format filename: CourseName_Date_Attendance.csv (sanitized)
        const safeCourseName = selectedCourse?.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'course';
        link.setAttribute('href', url);
        link.setAttribute('download', `${safeCourseName}_${attendanceDate}_attendance.csv`);
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="relative z-10 text-left">
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Attendance Roll</h2>
                    <p className="text-slate-500 text-sm mt-1">Select a course and mark student presence for {attendanceDate}.</p>
                </div>

                <div className="relative z-10 w-full md:w-auto flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-64">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1 text-left">Course</label>
                        <select
                            className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-brand-accent/5 font-semibold text-sm appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiPjxwYXRoIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIyIiBkPSJNMTkgOWwtNyA3LTctNyIvPjwvc3ZnPg==')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat"
                            value={selectedCourseId}
                            onChange={(e) => setSelectedCourseId(e.target.value)}
                        >
                            <option value="">Select Course...</option>
                            {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                        </select>
                    </div>
                    <div className="w-full sm:w-auto">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1 text-left">Date</label>
                        <input
                            type="date"
                            className="w-full sm:w-auto bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-brand-accent/5 font-semibold text-sm"
                            value={attendanceDate}
                            onChange={(e) => setAttendanceDate(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Attendance Table Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                {selectedCourseId ? (
                    <div className="overflow-x-auto">
                        {/* Table Controls (Export) */}
                        <div className="p-4 border-b border-slate-100 flex justify-end bg-slate-50/50">
                            <button
                                onClick={exportToCSV}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-50 hover:text-brand-primary hover:border-brand-primary/30 transition-all shadow-sm"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Export to Excel (CSV)
                            </button>
                        </div>
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Student Profile</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Roll No & Dept</th>
                                    <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {students.length > 0 ? students.map(student => {
                                    const status = getStatus(student._id);
                                    return (
                                        <tr key={student._id} className="hover:bg-slate-50/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-brand-primary font-bold text-sm border border-slate-200/50">
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="text-sm font-bold text-slate-800 tracking-tight">{student.name}</div>
                                                        <div className="text-[11px] text-slate-400 font-medium">{student.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-left">
                                                <div className="text-sm font-semibold text-slate-600">{student.rollNo || 'N/A'}</div>
                                                <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">{student.department || 'General'}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleSetStatus(student._id, 'present')}
                                                        className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${status === 'present'
                                                            ? 'bg-green-500 text-white border-green-600'
                                                            : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                                                            }`}
                                                    >
                                                        Present
                                                    </button>
                                                    <button
                                                        onClick={() => handleSetStatus(student._id, 'absent')}
                                                        className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${status === 'absent'
                                                            ? 'bg-red-500 text-white border-red-600'
                                                            : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                                                            }`}
                                                    >
                                                        Absent
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-12 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                                            No students enrolled in this course
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        </div>
                        <h3 className="text-slate-800 font-bold">Select a Course</h3>
                        <p className="text-slate-400 text-xs mt-1">Choose a program to start marking attendance.</p>
                    </div>
                )}
            </div>

            {/* Bottom Controls */}
            {selectedCourseId && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex items-center justify-between shadow-sm">
                    <div className="flex gap-6">
                         <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unmarked: {localRecords.filter(r => !r.status).length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Present: {localRecords.filter(r => r.status === 'present').length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Absent: {localRecords.filter(r => r.status === 'absent').length}</span>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => {
                                setLocalRecords(prev => prev.map(r => ({ ...r, status: 'present' })));
                            }}
                            className="px-6 py-3 bg-green-500/10 text-green-600 border border-green-200 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all"
                        >
                            Mark All Present
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-10 py-3 bg-brand-primary text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md shadow-brand-primary/10"
                        >
                            Save Attendance Data
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherAttendance;
