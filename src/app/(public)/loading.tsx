export default function PublicLoading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-choco-muted">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-sand border-t-brand" />
      <p className="text-sm">Cargando la agenda…</p>
    </div>
  );
}
