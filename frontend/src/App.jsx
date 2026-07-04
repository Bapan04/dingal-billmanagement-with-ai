import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Admission from './pages/Admission';
import Courses from './pages/Courses';
import Admins from './pages/Admins';
import Students from './pages/Students';
import StudentDetails from './pages/StudentDetails';
import AiInsights from './pages/AiInsights';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { Home, Users, BookOpen, ShieldCheck, UserCheck, LogOut, Sparkles } from 'lucide-react';

function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Do not show sidebar/header on login page
  if (location.pathname === '/') {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<Login />} />
          </Routes>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 hidden md:flex flex-col text-white">
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-green-400">Dingal Institute EMI</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/dashboard" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-green-400 rounded-md transition-colors">
            <Home className="w-5 h-5 mr-3" /> Dashboard
          </Link>
          <Link to="/admission" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-green-400 rounded-md transition-colors">
            <UserCheck className="w-5 h-5 mr-3" /> New Admission
          </Link>
          <Link to="/students" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-green-400 rounded-md transition-colors">
            <Users className="w-5 h-5 mr-3" /> Students Directory
          </Link>
          <Link to="/ai-insights" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-purple-400 rounded-md transition-colors">
            <Sparkles className="w-5 h-5 mr-3" /> AI Insights
          </Link>
          {user?.role === 'CORE_ADMIN' && (
            <>
              <Link to="/courses" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-green-400 rounded-md transition-colors">
                <BookOpen className="w-5 h-5 mr-3" /> Manage Courses
              </Link>
              <Link to="/admins" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-green-400 rounded-md transition-colors">
                <ShieldCheck className="w-5 h-5 mr-3" /> Manage Admins
              </Link>
            </>
          )}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center px-4 py-2 text-sm text-gray-400">
            Logged in as: <span className="ml-2 font-semibold text-white">{user?.name || 'Admin'}</span>
          </div>
          <div className="flex items-center px-4 py-1 text-xs text-green-500 font-bold">
            {user?.role}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white shadow-sm flex items-center px-6 justify-between flex-shrink-0 z-10">
          <h2 className="text-lg font-semibold text-gray-800">Dingal Institute Billing System</h2>
          <button onClick={handleLogout} className="flex items-center text-sm font-medium text-red-500 hover:text-red-700 transition-colors">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </button>
        </header>
        <div className="p-6 flex-1 overflow-y-auto bg-gray-50">
          <Routes>
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admission" element={<ProtectedRoute><Admission /></ProtectedRoute>} />
            <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
            <Route path="/students/:id" element={<ProtectedRoute><StudentDetails /></ProtectedRoute>} />
            <Route path="/ai-insights" element={<ProtectedRoute><AiInsights /></ProtectedRoute>} />
            <Route path="/courses" element={<ProtectedRoute allowedRoles={['CORE_ADMIN']}><Courses /></ProtectedRoute>} />
            <Route path="/admins" element={<ProtectedRoute allowedRoles={['CORE_ADMIN']}><Admins /></ProtectedRoute>} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
