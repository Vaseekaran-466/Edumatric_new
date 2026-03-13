import { useState } from 'react';
import { useData } from '../../context/DataContext';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';

const UserManagement = () => {
    const { users, addUser, updateUser, deleteUser } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState();
    const [formData, setFormData] = useState({ name: '', email: '', role: 'student' });

    const columns = [
        { header: 'Name', accessor: 'name' },
        { header: 'Email', accessor: 'email' },
        {
            header: 'Role', accessor: 'role', render: (row) => (
                <span className={`px-2.5 py-1 inline-flex text-[10px] font-bold uppercase rounded-md border ${row.role === 'admin' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                    row.role === 'teacher' ? 'bg-brand-accent/10 text-brand-accent border-brand-accent/10' :
                        'bg-slate-50 text-slate-500 border-slate-100'
                    }`}>
                    {row.role}
                </span>
            )
        },
        {
            header: 'Actions', accessor: 'actions', render: (row) => (
                <div className="flex gap-2">
                    <button onClick={() => handleEdit(row)} className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/5 rounded-lg transition-colors border border-transparent hover:border-brand-primary/10">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(row._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            )
        },
    ];

    const handleEdit = (user) => {
        setCurrentUser(user);
        setFormData({ name: user.name, email: user.email, role: user.role });
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            deleteUser(id);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let result;
        if (currentUser) {
            result = await updateUser({ ...currentUser, ...formData });
        } else {
            result = await addUser({
                ...formData,
                password: 'EduMatrix@2024',
                confirmPassword: 'EduMatrix@2024'
            });
        }
        if (result && result.success) {
            setIsModalOpen(false);
            setCurrentUser(null);
            setFormData({ name: '', email: '', role: 'student' });
        } else if (result && !result.success) {
            alert(result.message);
        }
    };

    const exportToCSV = () => {
        if (!users.length) return;

        const headers = ['Name', 'Email', 'Role'];
        
        const rows = users.map(user => {
            const escapeField = (field) => `"${String(field || '').replace(/"/g, '""')}"`;
            return [
                escapeField(user.name),
                escapeField(user.email),
                escapeField(user.role)
            ].join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        const date = new Date().toISOString().split('T')[0];
        link.setAttribute('href', url);
        link.setAttribute('download', `system_users_${date}.csv`);
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Active Users</h2>
                    <p className="text-slate-500 text-xs font-medium mt-1">Manage all platform accounts and permission levels.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={exportToCSV}
                        className="bg-white text-slate-600 border border-slate-200 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-50 hover:text-brand-primary hover:border-brand-primary/30 transition-colors shadow-sm flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export Excel
                    </button>
                    <button
                        onClick={() => { setCurrentUser(null); setFormData({ name: '', email: '', role: 'student' }); setIsModalOpen(true); }}
                        className="bg-brand-primary text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors shadow-sm"
                    >
                        Add New User
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <Table columns={columns} data={users} />
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentUser ? 'Edit Profile' : 'Create Account'}
            >
                <form onSubmit={handleSubmit} className="space-y-6 p-2">
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                        <input
                            type="text"
                            required
                            placeholder="John Doe"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-brand-accent/5 transition-all"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Email</label>
                        <input
                            type="email"
                            required
                            placeholder="user@email.com"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-brand-accent/5 transition-all"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Assign Role</label>
                        <select
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:bg-white transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_1rem_center] bg-no-repeat"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="admin">Administrator</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full py-4 bg-brand-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-sm mt-4"
                    >
                        {currentUser ? 'Save Changes' : 'Create User'}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default UserManagement;
