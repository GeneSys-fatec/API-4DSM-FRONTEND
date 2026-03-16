import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout.tsx';

// Um componente "Dummy" apenas para você provar que o conteúdo renderiza dentro do Layout
function PlaceholderPage() {
  return (
    <div className="p-8 flex items-center justify-center h-full border-4 border-dashed border-gray-200 rounded-xl m-8">
      <h2 className="text-2xl font-bold text-gray-400">Conteúdo da Página Entrará Aqui</h2>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        
        <Route element={<Layout />}>
          <Route path="/admin/dashboard" element={<PlaceholderPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}