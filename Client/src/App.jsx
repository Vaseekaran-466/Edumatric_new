import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import CourseManagement from './pages/admin/CourseManagement';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherCourseContent from './pages/teacher/CourseContent';
import AssessmentTools from './pages/teacher/AssessmentTools';
import TeacherAttendance from './pages/teacher/TeacherAttendance';
import StudentManager from './pages/teacher/StudentManager';

import StudentDashboard from './pages/student/StudentDashboard';
import StudentCourses from './pages/student/StudentCourses';
import CoursePlayer from './pages/student/CoursePlayer';
import StudentAssignments from './pages/student/StudentAssignments';
import StudentProgress from './pages/student/StudentProgress';
import Profile from './pages/common/Profile';
import ProtectedRoute from './components/common/ProtectedRoute';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Routes>
          {/* Public Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/courses" element={<CourseManagement />} />
              <Route path="/admin/profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Teacher Routes */}
          <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/teacher" element={<TeacherDashboard />} />
              <Route path="/teacher/courses" element={<TeacherCourseContent />} />
              <Route path="/teacher/assignments" element={<AssessmentTools />} />
              <Route path="/teacher/attendance" element={<TeacherAttendance />} />
              <Route path="/teacher/students" element={<StudentManager />} />
              <Route path="/teacher/profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/student/courses" element={<StudentCourses />} />
              <Route path="/student/courses/:courseId" element={<CoursePlayer />} />
              <Route path="/student/assignments" element={<StudentAssignments />} />
              <Route path="/student/progress" element={<StudentProgress />} />
              <Route path="/student/profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Catch all - 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;