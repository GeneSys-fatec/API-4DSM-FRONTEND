import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes';
import { AlertNotificationsProvider } from './context/alert-notifications-context';

export default function App() {
  return (
    <BrowserRouter>
      <AlertNotificationsProvider>
        <AppRoutes />
      </AlertNotificationsProvider>
    </BrowserRouter>
  );
}