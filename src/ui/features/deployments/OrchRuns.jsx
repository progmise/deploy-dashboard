import { RunBadge } from '../../components/Feedback.jsx';

export default function OrchRuns({ runs }) {
  return (
    <table>
      <thead>
        <tr><th>Run</th><th>Estado</th><th>Fecha</th><th>Acción</th></tr>
      </thead>
      <tbody>
        {runs.map((r) => (
          <tr key={r.id}>
            <td>{r.display_title || `#${r.run_number}`}</td>
            <td><RunBadge conclusion={r.conclusion} status={r.status} /></td>
            <td>{new Date(r.created_at).toLocaleString()}</td>
            <td><a href={r.html_url} target="_blank" rel="noreferrer">↗</a></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
