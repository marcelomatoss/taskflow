'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckSquare, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useI18n } from '@/lib/i18n';
import { LanguageToggle } from '@/components/language-toggle';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { t } = useI18n();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 relative">
      {/* Language toggle */}
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>

      <div className="flex max-w-lg flex-col items-center gap-8 text-center">
        {/* Logo */}
        <div className="flex items-center gap-3 text-primary">
          <CheckSquare className="h-12 w-12" />
          <span className="text-4xl font-bold tracking-tight text-foreground">
            TaskFlow
          </span>
        </div>

        {/* Descrição */}
        <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
          {t('heroDescription')}
        </p>

        {/* Botões */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/register"
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            {t('getStarted')}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="flex items-center justify-center rounded-lg border border-border bg-background px-6 py-2.5 font-medium text-foreground transition-colors hover:bg-muted"
          >
            {t('signIn')}
          </Link>
        </div>
      </div>
    </div>
  );
}
