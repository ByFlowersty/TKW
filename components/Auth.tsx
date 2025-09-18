import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C39.712,34.464,44,28.758,44,20C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);

export const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('¡Registro exitoso! Por favor, revisa tu correo electrónico para verificar tu cuenta.');
      }
    } catch (error: any) {
      setError(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen font-lato flex">
      {/* Columna del Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900">{isLogin ? 'Bienvenid@' : 'Crea una cuenta'}</h1>
            <p className="mt-2 text-gray-600">{isLogin ? 'Bienveni@' : 'Empieza a escribir.'}</p>
          </div>

          <form className="space-y-6" onSubmit={handleAuth}>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  required
                  className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-purple-light focus:border-brand-purple"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  required
                  className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-purple-light focus:border-brand-purple"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                    {/* Funcionalidad no implementada, solo UI */}
                    <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-brand-purple rounded border-gray-300 focus:ring-brand-purple" />
                    <label htmlFor="remember-me" className="ml-2 block text-gray-700">Remember for 30 days</label>
                </div>
                <a href="#" className="font-semibold text-brand-purple hover:underline">Forgot password</a>
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-purple text-white font-semibold py-3 px-4 rounded-md shadow-sm hover:bg-brand-purple-dark disabled:bg-gray-400 transition duration-150 ease-in-out"
              >
                {loading ? 'Processing...' : isLogin ? 'Sign In' : ''}
              </button>
              <button
                onClick={handleGoogleSignIn}
                type="button"
                className="w-full flex justify-center items-center gap-3 bg-white text-gray-700 font-semibold py-3 px-4 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition duration-150 ease-in-out"
              >
                <GoogleIcon />
                Sign in with Google
              </button>
            </div>
          </form>

          {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}
          {message && <p className="mt-4 text-center text-sm text-green-600">{message}</p>}

          <p className="mt-8 text-center text-sm text-gray-600">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button onClick={() => {setIsLogin(!isLogin); setError(null);}} className="font-semibold text-brand-purple hover:underline ml-1">
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>

      {/* Columna Gráfica */}
      <div className="hidden lg:flex w-1/2 items-center justify-center relative overflow-hidden">
         <div className="absolute inset-0 bg-brand-bg"></div>
         <div className="relative w-80 h-80">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-brand-purple rounded-b-full"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-80 h-40 bg-brand-purple opacity-20 blur-2xl"></div>
         </div>
      </div>
    </div>
  );
};