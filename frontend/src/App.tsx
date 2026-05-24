import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { NotFound } from './pages/NotFound';
import { MainLayout } from './layouts/MainLayout';
import { ChatPage } from './pages/ChatPage';
import { HistoryPage } from './pages/HistoryPage';
import { HistoryDetail } from './pages/HistoryDetail';
import { RequireAuth } from './auth/RequireAuth';


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 布局路由：没有 path，仅给子路由套 MainLayout */}
        <Route element={<MainLayout />}>
          {/* 守卫路由：把 <Outlet /> 包进 RequireAuth，下面所有子路由共享同一道守卫 */}
          <Route element={<RequireAuth><Outlet /></RequireAuth>}>
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/history/:id" element={<HistoryDetail />} />
          </Route>
          {/* / 重定向到 /chat —— 用 <Navigate /> 渲染一个声明式跳转 */}
          <Route path="/" element={<Navigate to="/chat" replace />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}