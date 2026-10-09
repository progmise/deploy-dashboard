// Component catalog — Supabase-backed, exposed by the API.
import { apiGet, apiSend } from './client.js';

export function getTemplates() {
  return apiGet('/api/templates');
}

export function getComponents() {
  return apiGet('/api/components');
}

export function getComponent(name) {
  return apiGet(`/api/components/${encodeURIComponent(name)}`);
}

export function createComponent(body) {
  return apiSend('/api/components', 'POST', body);
}

export function retryProvision(name) {
  return apiSend(`/api/components/${encodeURIComponent(name)}/provision`, 'POST');
}

export function getMembers() {
  return apiGet('/api/members');
}

export function createMember(body) {
  return apiSend('/api/members', 'POST', body);
}
