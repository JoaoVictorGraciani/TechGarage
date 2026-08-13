import { useEffect, useMemo, useState } from 'react';
import { Download, ShieldCheck, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ErrorBox, LoadingAdmin } from '../components/AdminFeedback';
import Pagination from '../components/Pagination';

const formatDate = (v) => new Intl.DateTimeFormat('pt-BR').format(new Date(v));

function Usuarios() {
  const { usuario: atual } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  const [perfil, setPerfil] = useState('todos');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let ativo = true;
    async function carregarInicial() {
      try {
        const { data } = await api.get('/users');
        if (ativo) setUsuarios(data);
      } catch (error) {
        if (ativo) setErro(error.response?.data?.message || 'Não foi possível carregar os usuários.');
      } finally {
        if (ativo) setLoading(false);
      }
    }
    carregarInicial();
    return () => { ativo = false; };
  }, []);

  const filtrados = useMemo(() => usuarios.filter((u) => (u.name.toLowerCase().includes(busca.toLowerCase()) || u.email.toLowerCase().includes(busca.toLowerCase())) && (perfil === 'todos' || u.role === perfil)), [usuarios,busca,perfil]);

  const pageSize=10; const totalPages=Math.max(1,Math.ceil(filtrados.length/pageSize)); const pageSafe=Math.min(page,totalPages); const exibidos=filtrados.slice((pageSafe-1)*pageSize,pageSafe*pageSize);

  async function alterarRole(u) {
    const role = u.role === 'ADMIN' ? 'CLIENT' : 'ADMIN';
    if (!window.confirm(`Alterar ${u.name} para ${role === 'ADMIN' ? 'Administrador' : 'Cliente'}?`)) return;
    try { setErro(''); const {data}=await api.patch(`/users/${u.id}`, { role }); setUsuarios((old) => old.map((x) => x.id === u.id ? data : x)); }
    catch(error){ setErro(error.response?.data?.message || 'Não foi possível alterar o perfil.'); }
  }
  async function excluir(u) { if (!window.confirm(`Excluir permanentemente o usuário ${u.name}?`)) return; try { setErro(''); await api.delete(`/users/${u.id}`); setUsuarios((old)=>old.filter((x)=>x.id!==u.id)); } catch(error){ setErro(error.response?.data?.message || 'Não foi possível excluir o usuário.'); } }
  function exportar(){ const rows=[['ID','Nome','Email','Telefone','Perfil','Cadastro'],...filtrados.map((u)=>[u.id,u.name,u.email,u.phone||'',u.role,formatDate(u.createdAt)])]; const csv='\ufeff'+rows.map((r)=>r.map((v)=>`"${String(v).replaceAll('"','""')}"`).join(';')).join('\n'); const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})); const a=document.createElement('a');a.href=url;a.download='techgarage-usuarios.csv';a.click();URL.revokeObjectURL(url); }

  if (loading) return <LoadingAdmin text="Carregando usuários..."/>;
  return <div><div className="mb-6"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">Acessos</p><h1 className="mt-1 text-3xl font-bold">Usuários</h1><p className="mt-1 text-sm text-[var(--color-text-secondary)]">Clientes e administradores cadastrados.</p></div><ErrorBox message={erro}/>
    <div className="mb-5 grid gap-3 sm:grid-cols-3"><Card label="Total" value={usuarios.length}/><Card label="Clientes" value={usuarios.filter((u)=>u.role==='CLIENT').length}/><Card label="Administradores" value={usuarios.filter((u)=>u.role==='ADMIN').length}/></div>
    <div className="mb-4 grid gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 md:grid-cols-[1fr_220px_auto]"><input className="admin-input" value={busca} onChange={(e)=>{setBusca(e.target.value);setPage(1)}} placeholder="Nome ou e-mail..."/><select className="admin-input" value={perfil} onChange={(e)=>{setPerfil(e.target.value);setPage(1)}}><option value="todos">Todos os perfis</option><option value="CLIENT">Clientes</option><option value="ADMIN">Administradores</option></select><button type="button" onClick={exportar} className="flex items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"><Download size={16}/> CSV</button></div>
    <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-sm"><thead className="bg-[var(--color-surface-hover)] text-left text-xs uppercase text-[var(--color-text-muted)]"><tr><th className="px-4 py-3">Usuário</th><th>Telefone</th><th>Perfil</th><th>Cadastro</th><th className="px-4 text-right">Ações</th></tr></thead><tbody>{exibidos.map((u)=><tr key={u.id} className="border-t border-[var(--color-border)]"><td className="px-4 py-3"><p className="font-medium">{u.name} {u.id === atual?.id && <span className="text-xs text-[var(--color-accent)]">(você)</span>}</p><p className="text-xs text-[var(--color-text-muted)]">{u.email}</p></td><td>{u.phone || '-'}</td><td><span className={`rounded-full px-2 py-1 text-xs font-semibold ${u.role==='ADMIN'?'bg-[var(--color-accent)]/10 text-[var(--color-accent)]':'bg-zinc-800 text-zinc-300'}`}>{u.role==='ADMIN'?'Administrador':'Cliente'}</span></td><td>{formatDate(u.createdAt)}</td><td className="px-4"><div className="flex justify-end gap-2"><button type="button" disabled={u.id===atual?.id} onClick={()=>alterarRole(u)} className="rounded-lg border border-[var(--color-border)] p-2 hover:text-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-30" title="Alterar perfil"><ShieldCheck size={15}/></button><button type="button" disabled={u.id===atual?.id} onClick={()=>excluir(u)} className="rounded-lg border border-[var(--color-border)] p-2 hover:text-[var(--color-danger)] disabled:cursor-not-allowed disabled:opacity-30" title="Excluir"><Trash2 size={15}/></button></div></td></tr>)}</tbody></table></div>{!filtrados.length&&<p className="p-8 text-center text-sm text-[var(--color-text-muted)]">Nenhum usuário encontrado.</p>}<Pagination page={pageSafe} onPageChange={setPage} total={filtrados.length} pageSize={pageSize}/></div>
  </div>;
}
function Card({label,value}){return <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"><p className="text-xs text-[var(--color-text-muted)]">{label}</p><p className="mt-1 text-2xl font-bold text-[var(--color-accent)]">{value}</p></div>}
export default Usuarios;
