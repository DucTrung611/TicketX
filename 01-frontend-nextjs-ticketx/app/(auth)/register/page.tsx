import Link from 'next/link';
import { RegisterForm } from '@/features/user';
import { ROUTES } from '@/shared/utils/routes';

export default function RegisterPage() {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/20 blur-3xl" />
      <div className="relative flex w-full max-w-sm flex-col items-center gap-6 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-zinc-900">
          Tạo tài khoản
        </h1>
        <RegisterForm />
        <p className="text-sm text-zinc-600">
          Đã có tài khoản?{' '}
          <Link href={ROUTES.login} className="font-medium text-accent hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
