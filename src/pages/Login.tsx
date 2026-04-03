import { LoginForm } from '../components/forms/LoginForm';

export function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-dashboard relative overflow-hidden">
      
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-tecsus-green/10 to-transparent -z-0" />
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-tecsus-green/5 to-transparent rounded-bl-full -z-0" />

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 flex flex-col items-center relative z-10">
        

        <h1 className="text-tecsus-green text-xl font-bold mb-6">
          Acesso Administrativo
        </h1>

        <LoginForm />

        <div className="mt-8 text-center text-sm text-gray-500 font-medium">
          © 2026 Tecsus
        </div>
      </div>
    </div>
  );
}