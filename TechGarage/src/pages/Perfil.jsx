import { Save, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function Perfil() {
  const { usuario, atualizarPerfil } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState(() => ({ name: usuario?.name || '', email: usuario?.email || '', phone: usuario?.phone || '', password: '' }));
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    const payload = { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() || null };
    if (form.password) payload.password = form.password;
    try {
      setSaving(true);
      const updated = await atualizarPerfil(payload);
      setForm({ name: updated.name || '', email: updated.email || '', phone: updated.phone || '', password: '' });
      toast.success('Perfil atualizado com sucesso.');
    } catch (error) { toast.error(error.message); }
    finally { setSaving(false); }
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white md:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6"><p className="text-xs font-bold uppercase tracking-[0.2em] text-lime-300">Minha conta</p><h1 className="mt-1 text-3xl font-black">Perfil</h1></div>
        <form onSubmit={submit} className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 sm:p-7">
          <div className="mb-6 flex items-center gap-4"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-lime-400/10 text-lime-300"><UserRound size={26}/></div><div><p className="font-semibold">{usuario?.name}</p><p className="text-sm text-zinc-500">{usuario?.role === 'ADMIN' ? 'Administrador' : 'Cliente'} · membro desde {usuario?.createdAt ? new Date(usuario.createdAt).toLocaleDateString('pt-BR') : '—'}</p></div></div>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Nome"><input className="store-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required/></Field><Field label="Telefone"><input className="store-input" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="(41) 99999-9999"/></Field></div>
          <div className="mt-4"><Field label="E-mail"><input type="email" className="store-input" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required/></Field></div>
          <div className="mt-4"><Field label="Nova senha (opcional)"><input type="password" minLength={8} className="store-input" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Deixe vazio para manter a atual"/></Field></div>
          <button disabled={saving} className="mt-6 flex items-center gap-2 rounded-xl bg-lime-400 px-5 py-3 text-sm font-black text-zinc-950 hover:bg-lime-300 disabled:opacity-50"><Save size={17}/>{saving ? 'Salvando...' : 'Salvar alterações'}</button>
        </form>
      </div>
    </main>
  );
}
function Field({ label, children }) { return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-zinc-400">{label}</span>{children}</label>; }
export default Perfil;
