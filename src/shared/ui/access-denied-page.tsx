export function AccessDeniedPage() {
  return (
    <section className="min-h-[calc(100vh-48px)]">
      <h1 className="text-2xl font-semibold text-[#101828]">Нет доступа</h1>
      <p className="mt-2 text-sm text-[#667085]">
        У вашей роли нет прав для просмотра этой страницы.
      </p>
    </section>
  );
}
