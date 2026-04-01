'use client';

import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import type { Project } from '@/types';
import { useI18n } from '@/lib/i18n';

const PRESET_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#ef4444', // red
  '#f59e0b', // amber
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
];

const projectSchema = z.object({
  title: z.string().min(1, 'Titulo e obrigatorio'),
  description: z.string().optional(),
  color: z.string(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  project?: Project;
}

export function ProjectModal({
  isOpen,
  onClose,
  onSubmit,
  project,
}: ProjectModalProps) {
  const { t } = useI18n();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: project?.title || '',
      description: project?.description || '',
      color: project?.color || PRESET_COLORS[0],
    },
  });

  const selectedColor = useWatch({ control, name: 'color' });

  useEffect(() => {
    if (isOpen) {
      reset({
        title: project?.title || '',
        description: project?.description || '',
        color: project?.color || PRESET_COLORS[0],
      });
    }
  }, [isOpen, project, reset]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const onFormSubmit = async (data: ProjectFormData) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-xl p-6 shadow-xl w-full max-w-md mx-4 border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            {project ? t('editProjectTitle') : t('createProjectTitle')}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t('projectTitleLabel')}
            </label>
            <input
              {...register('title')}
              className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={t('projectTitlePlaceholder')}
            />
            {errors.title && (
              <p className="text-destructive text-sm mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t('projectDescriptionLabel')}
            </label>
            <textarea
              {...register('description')}
              className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={3}
              placeholder={t('projectDescriptionPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('projectColorLabel')}
            </label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue('color', color)}
                  className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: color,
                    borderColor:
                      selectedColor === color
                        ? 'var(--color-foreground)'
                        : 'transparent',
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? t('saving') : project ? t('save') : t('create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
