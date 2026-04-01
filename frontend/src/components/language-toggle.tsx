'use client';

import { Globe } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface LanguageToggleProps {
  className?: string;
}

export function LanguageToggle({ className = '' }: LanguageToggleProps) {
  const { locale, setLocale } = useI18n();

  const toggle = () => {
    setLocale(locale === 'pt-BR' ? 'en' : 'pt-BR');
  };

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1.5 p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ${className}`}
      aria-label="Toggle language"
    >
      <Globe className="w-4 h-4" />
      <span className="text-xs font-medium">
        {locale === 'pt-BR' ? 'EN' : 'PT'}
      </span>
    </button>
  );
}
