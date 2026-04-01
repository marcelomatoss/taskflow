'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import type { Task, TaskStatus, Priority } from '@/types';
import { useI18n } from '@/lib/i18n';

const taskSchema = z.object({
  title: z.string().min(1, 'Titulo e obrigatorio'),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  dueDate: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => Promise<void>;
  task?: Task;
  projectId: string;
  defaultStatus?: TaskStatus;
}

export function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  task,
  defaultStatus = 'TODO',
}: TaskModalProps) {
  const { t } = useI18n();

  const statusLabels: Record<TaskStatus, string> = {
    TODO: t('todo'),
    IN_PROGRESS: t('inProgress'),
    DONE: t('done'),
  };

  const priorityLabels: Record<Priority, string> = {
    LOW: t('low'),
    MEDIUM: t('medium'),
    HIGH: t('high'),
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      status: task?.status || defaultStatus,
      priority: task?.priority || 'MEDIUM',
      dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        title: task?.title || '',
        description: task?.description || '',
        status: task?.status || defaultStatus,
        priority: task?.priority || 'MEDIUM',
        dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
      });
    }
  }, [isOpen, task, defaultStatus, reset]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const onFormSubmit = async (data: TaskFormData) => {
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
            {task ? t('editTaskTitle') : t('createTaskTitle')}
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
              {t('taskTitleLabel')}
            </label>
            <input
              {...register('title')}
              className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={t('taskTitlePlaceholder')}
            />
            {errors.title && (
              <p className="text-destructive text-sm mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t('taskDescriptionLabel')}
            </label>
            <textarea
              {...register('description')}
              className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={3}
              placeholder={t('taskDescriptionPlaceholder')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t('taskStatusLabel')}
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {(Object.entries(statusLabels) as [TaskStatus, string][]).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t('taskPriorityLabel')}
              </label>
              <select
                {...register('priority')}
                className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {(Object.entries(priorityLabels) as [Priority, string][]).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t('taskDueDateLabel')}
            </label>
            <input
              type="date"
              {...register('dueDate')}
              className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
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
              {isSubmitting ? t('saving') : task ? t('save') : t('create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
