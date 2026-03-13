import { Outlet } from 'react-router-dom';

const MainLayout = () => {
    return (
        <div className="min-h-screen bg-gray-100">
            <Outlet />
        </div>
    );
};

export default MainLayout;
