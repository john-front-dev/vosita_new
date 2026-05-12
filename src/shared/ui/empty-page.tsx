type EmptyPageProps = {
  title: string;
};

export const EmptyPage = ({ title }: EmptyPageProps) => {
  return (
    <section className="min-h-[calc(100vh-48px)]">
      <div>
        <h1 className="text-2xl font-semibold text-[#101828]">{title}</h1>
        <p className="mt-2 text-sm text-[#667085]">Страница пока пустая</p>
      </div>
    </section>
  );
};
