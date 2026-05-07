import { EmptyPage } from '@shared/ui';

type PlaceholderPageProps = {
  title: string;
};

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return <EmptyPage title={title} />;
}
