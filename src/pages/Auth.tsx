import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, LogIn, Building2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { trackEvent, identifyUser } from '../lib/amplitude';
import { useToast } from '../components/Toast';

export function Auth({ type }: { type: 'login' | 'register' }) {
  const { login } = useAppContext();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'registered' | 'organizer' | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Password strength
  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9!@#$&*]/.test(password)) strength += 1;
    return strength;
  };
  const strength = getPasswordStrength();
  const strengthColor = strength === 0 ? 'bg-gray-700' : strength === 1 ? 'bg-red-500' : strength === 2 ? 'bg-[var(--color-accent-yellow)]' : 'bg-[var(--color-accent-mint)]';
  const strengthText = strength === 0 ? '' : strength === 1 ? 'Débil' : strength === 2 ? 'Regular' : 'Fuerte';

  // Validation
  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const isRegisterValid = name.length >= 3 && isValidEmail(email) && password.length >= 8 && password === confirmPassword && role && acceptTerms;
  const isLoginValid = isValidEmail(email) && password.length > 0;

  const handleAuthRedirect = (selectedRole: string) => {
    const redirectUrl = localStorage.getItem('redirectAfterLogin') || (selectedRole === 'organizer' ? '/organizer' : '/');
    localStorage.removeItem('redirectAfterLogin');
    navigate(redirectUrl);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRegisterValid || isLoading) return;
    
    setIsLoading(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1500));
    
    login(role as 'registered' | 'organizer', { name, email });
    identifyUser({ role: role as string, signed_up: true });
    trackEvent('User Registered', { role: role as string });
    
    setIsLoading(false);
    handleAuthRedirect(role as string);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoginValid || isLoading) return;
    
    setIsLoading(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1500));
    
    const loginRole = email.includes('organizer') ? 'organizer' : 'registered';
    login(loginRole, { name: loginRole === 'organizer' ? 'Organizador Demo' : 'Usuario Demo', email });
    identifyUser({ role: loginRole, signed_up: false });
    trackEvent('User Logged In', { role: loginRole });
    
    setIsLoading(false);
    handleAuthRedirect(loginRole);
  };

  const handleDemoFastLogin = (demoRole: 'registered' | 'organizer') => {
    login(demoRole, { name: demoRole === 'organizer' ? 'Organizador Demo' : 'Usuario Demo', email: `demo@${demoRole}.minders.io` });
    identifyUser({ role: demoRole, signed_up: false });
    trackEvent('User Logged In', { role: demoRole });
    handleAuthRedirect(demoRole);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Si este email existe, recibirás instrucciones en breve (Demo)', 'info');
    setShowForgot(false);
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 animate-in fade-in">
      <div className="bg-[var(--color-surface)] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 bg-[var(--color-surface)]/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-[var(--color-accent-cyan)] animate-spin" />
          </div>
        )}

        <h1 className="text-2xl font-bold mb-2 uppercase tracking-tight text-center">
          {type === 'login' ? 'Bienvenido de vuelta' : 'Únete a Minders'}
        </h1>
        <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-8 text-center">
          {type === 'login' ? 'Ingresa tus datos para continuar.' : 'Crea tu cuenta gratis hoy mismo.'}
        </p>

        {type === 'register' ? (
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Tipo de Cuenta</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  onClick={() => setRole('registered')}
                  className={`p-3 border rounded-xl flex flex-col items-center justify-center gap-2 transition-colors ${role === 'registered' ? 'border-[var(--color-accent-cyan)] bg-[var(--color-accent-cyan)]/10 text-[var(--color-accent-cyan)]' : 'border-white/10 text-gray-400 hover:border-white/20 hover:bg-white/5'}`}
                >
                  <User className="w-5 h-5" />
                  <span className="text-[10px] uppercase tracking-widest font-bold">Fan</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setRole('organizer')}
                  className={`p-3 border rounded-xl flex flex-col items-center justify-center gap-2 transition-colors ${role === 'organizer' ? 'border-[var(--color-accent-mint)] bg-[var(--color-accent-mint)]/10 text-[var(--color-accent-mint)]' : 'border-white/10 text-gray-400 hover:border-white/20 hover:bg-white/5'}`}
                >
                  <Building2 className="w-5 h-5" />
                  <span className="text-[10px] uppercase tracking-widest font-bold">Organizador</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Nombre Completo</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Juan Pérez"
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-[var(--color-accent-cyan)] transition-colors"
                required
              />
              {name.length > 0 && name.length < 3 && <p className="text-red-400 text-[10px] uppercase tracking-wider font-bold mt-1">Mínimo 3 caracteres</p>}
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Correo Electrónico</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="juan@correo.com"
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-[var(--color-accent-cyan)] transition-colors"
                required
              />
              {email.length > 0 && !isValidEmail(email) && <p className="text-red-400 text-[10px] uppercase tracking-wider font-bold mt-1">Correo inválido</p>}
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Contraseña</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-[var(--color-accent-cyan)] transition-colors pr-10"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full transition-all w-${strength}/3 ${strengthColor}`} style={{width: `${(strength/3)*100}%`}}></div>
                  </div>
                  <span className={`text-[10px] uppercase font-bold tracking-widest ${strengthColor.replace('bg-', 'text-')}`}>{strengthText}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Confirmar Contraseña</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-[var(--color-accent-cyan)] transition-colors pr-10"
                  required
                />
              </div>
              {confirmPassword.length > 0 && password !== confirmPassword && <p className="text-red-400 text-[10px] uppercase tracking-wider font-bold mt-1">Las contraseñas no coinciden</p>}
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="mt-1 w-4 h-4 accent-[var(--color-accent-cyan)] rounded focus:ring-offset-0 focus:ring-0" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 leading-snug">Acepto los <a href="#" className="text-[var(--color-accent-cyan)]">Términos de Servicio</a> y la <a href="#" className="text-[var(--color-accent-cyan)]">Política de Privacidad</a></span>
            </label>

            <button 
              type="submit"
              disabled={!isRegisterValid || isLoading}
              className="w-full py-4 mt-6 bg-gradient-to-r from-[var(--color-accent-purple)] to-[var(--color-accent-pink)] text-white font-bold rounded-xl text-sm uppercase tracking-widest hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:grayscale"
            >
              Crear cuenta
            </button>
            <div className="text-center mt-6 text-sm">
              <span className="text-gray-400">¿Ya tienes cuenta? </span>
              <Link to="/login" className="text-[var(--color-accent-cyan)] hover:underline font-bold">Inicia sesión</Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-5">
            {showForgot ? (
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl animate-in fade-in slide-in-from-top-2">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-2">Recuperar contraseña</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-4 line-clamp-2">Ingresa tu email para recibir instrucciones (Demo).</p>
                <input 
                  type="email" 
                  placeholder="Tu correo"
                  className="w-full p-3 bg-black/20 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-[var(--color-accent-cyan)] transition-colors mb-3"
                  required
                />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 py-3 bg-[var(--color-accent-cyan)] text-black text-[10px] uppercase tracking-widest font-bold rounded-xl hover:opacity-90 transition-opacity" onClick={handleForgotSubmit}>Enviar enlace</button>
                  <button type="button" onClick={() => setShowForgot(false)} className="px-4 text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-white transition-colors">Cancelar</button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Correo Electrónico</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="demo@minders.io"
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-[var(--color-accent-cyan)] transition-colors"
                    required
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold">Contraseña</label>
                    <button type="button" onClick={() => setShowForgot(true)} className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-accent-cyan)] hover:underline">¿Olvidaste tu contraseña?</button>
                  </div>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-[var(--color-accent-cyan)] transition-colors pr-10"
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={!isLoginValid || isLoading}
                  className="w-full py-4 mt-6 bg-[var(--color-accent-cyan)] text-black font-bold rounded-xl text-sm uppercase tracking-widest hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(34,211,238,0.3)] disabled:opacity-50 disabled:grayscale"
                >
                  Iniciar Sesión
                </button>

                <div className="pt-6 border-t border-white/10 mt-6">
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-3 text-center">Demo Rápido</p>
                  <div className="flex gap-3">
                    <button 
                      type="button"
                      onClick={() => handleDemoFastLogin('registered')}
                      className="flex-1 py-2 px-3 bg-transparent border border-[var(--color-accent-cyan)]/50 text-[var(--color-accent-cyan)] rounded-lg text-[10px] uppercase tracking-widest font-bold hover:bg-[var(--color-accent-cyan)]/10 transition-colors flex flex-col items-center gap-1"
                    >
                      <span className="bg-[var(--color-accent-cyan)]/20 text-[var(--color-accent-cyan)] px-1.5 rounded-sm text-[8px]">DEMO</span>
                      Entrar Fan
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleDemoFastLogin('organizer')}
                      className="flex-1 py-2 px-3 bg-transparent border border-[var(--color-accent-mint)]/50 text-[var(--color-accent-mint)] rounded-lg text-[10px] uppercase tracking-widest font-bold hover:bg-[var(--color-accent-mint)]/10 transition-colors flex flex-col items-center gap-1"
                    >
                      <span className="bg-[var(--color-accent-mint)]/20 text-[var(--color-accent-mint)] px-1.5 rounded-sm text-[8px]">DEMO</span>
                      Entrar Org
                    </button>
                  </div>
                </div>

                <div className="text-center mt-6 text-sm">
                  <span className="text-gray-400">¿No tienes cuenta? </span>
                  <Link to="/register" className="text-[var(--color-accent-cyan)] hover:underline font-bold">Regístrate</Link>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
