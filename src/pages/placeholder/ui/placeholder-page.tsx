import { EmptyPage } from '@shared/ui';

type PlaceholderPageProps = {
  title: string;
};

export const PlaceholderPage = ({ title }: PlaceholderPageProps) => {
  return <EmptyPage title={title} />;
};
