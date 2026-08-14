import { ChevronLeft, ChevronRight } from 'lucide-react';

function Pagination({ page, onPageChange, total, pageSize = 10 }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, pages);
  if (pages <= 1) return null;
  const windowStart = Math.max(1, Math.min(current - 2, pages - 4));
  const visible = Array.from({ length: Math.min(5, pages) }, (_, index) => windowStart + index);
  return <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 px-4 py-3"><p className="text-xs text-zinc-600">Página {current} de {pages} · {total} registro(s)</p><div className="flex gap-1"><button type="button" disabled={current<=1} onClick={()=>onPageChange(current-1)} className="grid h-8 w-8 place-items-center rounded-lg border border-zinc-800 text-zinc-400 hover:border-zinc-600 disabled:opacity-30"><ChevronLeft size={15}/></button>{visible.map((p)=><button key={p} type="button" onClick={()=>onPageChange(p)} className={`h-8 min-w-8 rounded-lg px-2 text-xs font-bold ${p===current?'bg-lime-400 text-zinc-950':'border border-zinc-800 text-zinc-400 hover:border-zinc-600'}`}>{p}</button>)}<button type="button" disabled={current>=pages} onClick={()=>onPageChange(current+1)} className="grid h-8 w-8 place-items-center rounded-lg border border-zinc-800 text-zinc-400 hover:border-zinc-600 disabled:opacity-30"><ChevronRight size={15}/></button></div></div>;
}
export default Pagination;
