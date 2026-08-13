import Link from 'next/link';
import { LoginForm } from '@/features/user';
import { ROUTES } from '@/shared/utils/routes';

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Đăng nhập
      </h1>
      <LoginForm />
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Chưa có tài khoản?{' '}
        <Link href={ROUTES.register} className="font-medium text-zinc-900 underline dark:text-zinc-50">
          Đăng ký
        </Link>
      </p>
    </div>
  );
}
