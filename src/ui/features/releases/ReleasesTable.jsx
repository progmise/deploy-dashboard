export default function ReleasesTable({ items }) {
  return (
    <table>
      <thead>
        <tr><th>Release</th><th>Versión</th><th>Estado</th><th>Fecha</th><th>Acción</th></tr>
      </thead>
      <tbody>
        {items.map((r) => (
          <tr key={r.id}>
            <td>{r.name || r.tag_name}</td>
            <td><code>{r.tag_name}</code></td>
            <td>{r.draft
              ? <span className="pill draft">Borrador</span>
              : <span className="pill ok">Publicado</span>}</td>
            <td>{new Date(r.created_at).toLocaleDateString()}</td>
            <td><a href={r.html_url} target="_blank" rel="noreferrer">↗</a></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
