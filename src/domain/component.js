// Pure component rules — no react/fetch imports. Mirrors the API's domain.

// Provisioning lifecycle — mirrors the state machine in the API
// (application/usecases/provisionComponent.js). Pending states render as
// "in progress".
export const STATUS_LABEL = {
  pending: 'En cola',
  repo_created: 'Repo creado',
  secrets_written: 'Secrets configurados',
  vars_written: 'Variables configuradas',
  manifest_pr_opened: 'PR al manifest',
  ready: 'Ready',
  failed: 'Falló',
};

export const NAME_RE = /^[a-z0-9][a-z0-9-]{0,38}[a-z0-9]$/;
export const REPO_RE = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,99}$/;

// Joins the manifest's deployed components with the catalog's lifecycle rows:
// catalog entries missing from the manifest are still provisioning (or failed).
export function mergeCatalog(manifestComponents, catalog) {
  return [
    ...manifestComponents.map((c) => ({ ...c, db: catalog.find((d) => d.name === c.name) })),
    ...catalog
      .filter((d) => !manifestComponents.some((c) => c.name === d.name))
      .map((d) => ({ name: d.name, repo: d.repo, tag: '—', needs: [], db: d })),
  ];
}

export const filter = (items, q, keys) =>
  items.filter((i) => keys.some((k) => (i[k] || '').toLowerCase().includes(q)));
