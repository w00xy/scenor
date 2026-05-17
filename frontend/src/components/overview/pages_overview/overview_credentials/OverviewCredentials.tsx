import { JSX, useEffect, useState, useMemo } from 'react';
import { credentialsApi } from '../../../../services/api';
import { useProjects } from '../../../../context/ProjectsContext';
import { CredentialCardComponent } from './CredentialCardComponent';
import { MM_overview_scen_div_one } from '../../../overview/pages_overview/overview_scen/MM_overview_scen_div_one/MM_overview_scen_div_one';
import { MM_overview_scen_div_two } from '../../../overview/pages_overview/overview_scen/MM_overview_scen_div_two/MM_overview_scen_div_two';
import { ProjectEmptyState } from '../../../project-pages/project_empty_state/ProjectEmptyState';
import { useCurrentUsername } from '../../../../hooks/useCurrentUsername';
import './OverviewCredentials.scss';

interface Credential {
  id: string;
  projectId: string;
  name: string;
  type: string;
  createdAt: string;
}

interface CredentialWithProject extends Credential {
  projectName: string;
}

const ITEMS_PER_PAGE = 5;

export function OverviewCredentials(): JSX.Element {
  const username = useCurrentUsername();
  const { projects, personalProjectId } = useProjects();
  const [allCreds, setAllCreds] = useState<CredentialWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('api_key');
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const loadAll = async () => {
    if (projects.length === 0) { setLoading(false); return; }
    setLoading(true);
    try {
      const arrs = await Promise.all(projects.map(async (p) => {
        try { const creds = await credentialsApi.getCredentials(p.id); return creds.map(c => ({ ...c, projectName: p.name })); }
        catch { return []; }
      }));
      setAllCreds(arrs.flat());
    } finally { setLoading(false); }
  };

  useEffect(() => { loadAll(); }, [projects.length]);

  useEffect(() => {
    const handler = () => setShowCreate(true);
    window.addEventListener('open-credential-form', handler);
    return () => window.removeEventListener('open-credential-form', handler);
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить учётные данные?')) return;
    try { await credentialsApi.deleteCredential(id); loadAll(); }
    catch (e) { console.error(e); }
  };

  const handleCreate = async () => {
    if (!name.trim() || !personalProjectId) return;
    setSaving(true);
    try {
      await credentialsApi.createCredential(personalProjectId, { name: name.trim(), type, data: { apiKey } });
      setName(''); setApiKey(''); setShowCreate(false);
      loadAll();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const filtered = useMemo(() => {
    let result = allCreds;
    if (search.trim()) result = result.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
    if (sortBy === 'Name') result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'Creation date') result = [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return result;
  }, [allCreds, search, sortBy]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [search, sortBy]);

  if (loading) return <div className="MM_overview_scen"><div className="admin-page__loading">Загрузка...</div></div>;

  const hasData = allCreds.length > 0;

  return (
    <div className="MM_overview_scen">
      {hasData && (
        <MM_overview_scen_div_one
          placeholder="Поиск" sortBy={sortBy} onSortChange={setSortBy}
          searchValue={search} onSearchChange={setSearch} noUpdateDate
        />
      )}

      {showCreate && (
        <div className="overview-credentials__create">
          <div className="overview-credentials__field">
            <input className="overview-credentials__field-input" placeholder="Название" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="overview-credentials__field">
            <select className="overview-credentials__field-select" value={type} onChange={e => setType(e.target.value)}>
              <option value="api_key">API Key</option>
              <option value="basic_auth">Basic Auth</option>
              <option value="oauth">OAuth</option>
            </select>
          </div>
          <div className="overview-credentials__field">
            <input className="overview-credentials__field-input" placeholder="Значение" value={apiKey} onChange={e => setApiKey(e.target.value)} />
          </div>
          <button className="overview-credentials__btn" onClick={handleCreate} disabled={saving}>{saving ? '...' : 'Сохранить'}</button>
          <button className="overview-credentials__btn overview-credentials__btn--cancel" onClick={() => setShowCreate(false)}>Отмена</button>
        </div>
      )}

      {!hasData && !showCreate ? (
        <ProjectEmptyState
          title={`${username},`}
          subtitle="давайте добавим первые учётные данные"
          description="Учётные данные позволяют сценариям взаимодействовать с внешними сервисами через API."
          actionText="Добавить первые учётные данные"
          onAction={() => setShowCreate(true)}
        />
      ) : (
        <>
          {paginated.map(c => (
            <CredentialCardComponent key={c.id} name={c.name} type={c.type} projectName={c.projectName} createdAt={c.createdAt} onDelete={() => handleDelete(c.id)} />
          ))}
          <MM_overview_scen_div_two count={filtered.length} currentPage={currentPage} totalPages={totalPages || 1} onPageChange={setCurrentPage} />
        </>
      )}
    </div>
  );
}
