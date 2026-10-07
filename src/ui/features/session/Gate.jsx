// Session feature — the screens and widgets around the signed-in user.
import { CenterCard } from '../../components/Feedback.jsx';
import { GhIcon } from '../../components/Icons.jsx';

export function Login() {
  return (
    <CenterCard title="Deploy Orchestrator" sub="progmise release orchestration">
      <a className="login-btn" href="/api/auth/login">{GhIcon} Sign in with GitHub</a>
    </CenterCard>
  );
}

export function Unauthorized() {
  return (
    <CenterCard title="No autorizado" sub="Tu usuario de GitHub no tiene acceso a esta herramienta.">
      <a className="btn btn-outline" href="/api/logout">Cerrar sesión</a>
    </CenterCard>
  );
}

export function UserMenu({ user }) {
  return (
    <div className="user">
      <img src={user.avatar_url} alt="" width="26" height="26" />
      <span>{user.login}</span>
      <a href="/api/logout">Salir</a>
    </div>
  );
}
