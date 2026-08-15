import { redirect } from 'next/navigation';
import { ROUTES } from '@/shared/utils/routes';

export default function AdminIndexPage() {
  redirect(ROUTES.adminMovies);
}
