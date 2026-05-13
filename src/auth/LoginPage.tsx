import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { company } from '@/theme';

export function LoginPage() {
  const { authenticated, login } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (authenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const ok = await login(password);
      if (!ok) setError('Senha incorreta.');
    } catch {
      setError('Não foi possível validar agora. Tente de novo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div
        className="absolute inset-0 -z-10 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse at top, rgba(200,168,78,0.12), transparent 60%), radial-gradient(ellipse at bottom, rgba(13,27,42,0.6), transparent 70%)',
        }}
      />
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <img
              src="/escala-logo.svg"
              alt="Escala Negócios Digitais"
              className="h-[120px] w-auto mb-6"
              style={{ filter: 'drop-shadow(0 0 40px rgba(200,168,78,0.25)) drop-shadow(0 4px 24px rgba(0,0,0,0.6))' }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <span className="section-tag mb-2">Assessoria de performance</span>
            <h1 className="font-display font-bold text-3xl md:text-4xl text-center">Dashboard Revert</h1>
            <p className="text-gray-300 text-sm mt-2 text-center">Energia solar com método. Acesso restrito.</p>
          </div>
          <form onSubmit={handleSubmit} className="card-escala space-y-5">
            <div>
              <label htmlFor="password" className="section-tag block mb-2">
                Senha
              </label>
              <input
                id="password"
                type="password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-navy text-white rounded-md border border-gold/20 focus:border-gold focus:outline-none transition"
                placeholder="Digite a senha"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
            {error && (
              <div className="text-danger text-sm border border-danger/30 bg-danger/10 px-3 py-2 rounded-md">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading || password.length === 0}
              className="w-full py-3 bg-gold hover:bg-goldLight disabled:opacity-50 disabled:cursor-not-allowed text-navy font-semibold uppercase tracking-wider rounded-md transition"
            >
              {loading ? 'Validando…' : 'Entrar'}
            </button>
          </form>
        </div>
      </main>
      <footer className="py-6 text-center text-xs text-gray-500">
        <div className="font-display italic text-gold">{company.tagline}</div>
        <div className="mt-1">{company.cities}</div>
      </footer>
    </div>
  );
}
