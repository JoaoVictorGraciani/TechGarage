export function ErrorBox({ message }) {
  if (!message) return null;
  return (
    <div className="mb-5 rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-4 py-3 text-sm text-[var(--color-danger)]">
      {message}
    </div>
  );
}

export function SuccessBox({ message }) {
  if (!message) return null;
  return (
    <div className="mb-5 rounded-xl border border-[var(--color-success)]/30 bg-[var(--color-success)]/10 px-4 py-3 text-sm text-[var(--color-success)]">
      {message}
    </div>
  );
}

export function LoadingAdmin({ text = 'Carregando...' }) {
  return (
    <div className="flex min-h-52 items-center justify-center text-sm text-[var(--color-text-secondary)]">
      {text}
    </div>
  );
}
