'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { Project, Task, TaskStatus, Priority } from '@/types';
import { TaskModal } from '@/components/task-modal';
import { ProjectModal } from '@/components/project-modal';
import { ConfirmDialog } from '@/components/confirm-dialog';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Pencil,
  Calendar,
  Flag,
  CheckSquare,
} from 'lucide-react';

const COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: 'TODO', label: 'A Fazer' },
  { key: 'IN_PROGRESS', label: 'Em Progresso' },
  { key: 'DONE', label: 'Concluido' },
];

const PRIORITY_CONFIG: Record<Priority, { label: string; className: string }> =
  {
    LOW: { label: 'Baixa', className: 'bg-success/20 text-success' },
    MEDIUM: { label: 'Media', className: 'bg-warning/20 text-warning' },
    HIGH: { label: 'Alta', className: 'bg-destructive/20 text-destructive' },
  };

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // Modais
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [defaultTaskStatus, setDefaultTaskStatus] =
    useState<TaskStatus>('TODO');
  const [deleteTaskTarget, setDeleteTaskTarget] = useState<Task | null>(null);

  const [projectModalOpen, setProjectModalOpen] = useState(false);

  // Drag and drop
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const fetchProject = useCallback(async () => {
    try {
      const data = await api.projects.get(projectId);
      setProject(data);
    } catch (err) {
      console.error('Erro ao carregar projeto:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleCreateTask = async (data: {
    title: string;
    description?: string;
    status: TaskStatus;
    priority: Priority;
    dueDate?: string;
  }) => {
    await api.tasks.create({
      ...data,
      dueDate: data.dueDate || undefined,
      projectId,
    });
    await fetchProject();
  };

  const handleEditTask = async (data: {
    title: string;
    description?: string;
    status: TaskStatus;
    priority: Priority;
    dueDate?: string;
  }) => {
    if (!editingTask) return;
    await api.tasks.update(editingTask.id, {
      ...data,
      dueDate: data.dueDate || undefined,
    });
    setEditingTask(undefined);
    await fetchProject();
  };

  const handleDeleteTask = async () => {
    if (!deleteTaskTarget) return;
    await api.tasks.delete(deleteTaskTarget.id);
    setDeleteTaskTarget(null);
    await fetchProject();
  };

  const handleChangeStatus = async (task: Task, newStatus: TaskStatus) => {
    await api.tasks.update(task.id, { status: newStatus });
    await fetchProject();
  };

  const handleEditProject = async (data: {
    title: string;
    description?: string;
    color: string;
  }) => {
    await api.projects.update(projectId, data);
    await fetchProject();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  };

  const getTasksByStatus = (status: TaskStatus): Task[] => {
    return (project?.tasks || []).filter((t) => t.status === status);
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    if (!draggedTaskId) return;

    const task = project?.tasks?.find((t) => t.id === draggedTaskId);
    if (task && task.status !== targetStatus) {
      await handleChangeStatus(task, targetStatus);
    }
    setDraggedTaskId(null);
  };

  // Skeleton
  if (loading) {
    return (
      <div>
        <div className="h-6 w-32 bg-muted rounded animate-pulse mb-4" />
        <div className="h-8 w-64 bg-muted rounded animate-pulse mb-2" />
        <div className="h-4 w-96 bg-muted rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-muted/50 rounded-lg p-4 min-h-[300px] animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground mb-4">Projeto nao encontrado.</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Dashboard
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <button
        onClick={() => router.push('/dashboard')}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar ao Dashboard
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-8 rounded-full"
            style={{ backgroundColor: project.color }}
          />
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {project.title}
            </h1>
            {project.description && (
              <p className="text-muted-foreground text-sm mt-0.5">
                {project.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setProjectModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors text-sm"
          >
            <Pencil className="w-4 h-4" />
            Editar Projeto
          </button>
          <button
            onClick={() => {
              setEditingTask(undefined);
              setDefaultTaskStatus('TODO');
              setTaskModalOpen(true);
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Nova Tarefa
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((column) => {
          const tasks = getTasksByStatus(column.key);
          return (
            <div
              key={column.key}
              className={`bg-muted/50 rounded-lg p-4 min-h-[300px] transition-colors ${
                dragOverColumn === column.key
                  ? 'ring-2 ring-primary bg-primary/5'
                  : ''
              }`}
              onDragOver={(e) => handleDragOver(e, column.key)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.key)}
            >
              {/* Column header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-foreground text-sm uppercase tracking-wide">
                    {column.label}
                  </h2>
                  <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">
                    {tasks.length}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setEditingTask(undefined);
                    setDefaultTaskStatus(column.key);
                    setTaskModalOpen(true);
                  }}
                  className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={`Adicionar tarefa em ${column.label}`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Task cards */}
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    className={`bg-background rounded-lg p-3 border border-border shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group ${
                      draggedTaskId === task.id ? 'opacity-50' : ''
                    }`}
                    onClick={() => {
                      setEditingTask(task);
                      setTaskModalOpen(true);
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-sm font-medium text-foreground line-clamp-2 flex-1">
                        {task.title}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTaskTarget(task);
                        }}
                        className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-muted text-muted-foreground hover:text-destructive transition-all ml-1"
                        aria-label="Excluir tarefa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {task.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_CONFIG[task.priority].className}`}
                      >
                        <Flag className="w-3 h-3" />
                        {PRIORITY_CONFIG[task.priority].label}
                      </span>

                      {task.dueDate && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {formatDate(task.dueDate)}
                        </span>
                      )}
                    </div>

                    {/* Botoes de mudanca rapida de status */}
                    <div className="flex gap-1 mt-2 pt-2 border-t border-border">
                      {COLUMNS.filter((c) => c.key !== task.status).map(
                        (col) => (
                          <button
                            key={col.key}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleChangeStatus(task, col.key);
                            }}
                            className="flex-1 flex items-center justify-center gap-1 text-xs py-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <CheckSquare className="w-3 h-3" />
                            {col.label}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                ))}

                {tasks.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-8">
                    Nenhuma tarefa
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de tarefa */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(undefined);
        }}
        onSubmit={editingTask ? handleEditTask : handleCreateTask}
        task={editingTask}
        projectId={projectId}
        defaultStatus={defaultTaskStatus}
      />

      {/* Modal de editar projeto */}
      <ProjectModal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        onSubmit={handleEditProject}
        project={project}
      />

      {/* Confirmacao de exclusao de tarefa */}
      <ConfirmDialog
        isOpen={!!deleteTaskTarget}
        onClose={() => setDeleteTaskTarget(null)}
        onConfirm={handleDeleteTask}
        title="Excluir Tarefa"
        message={`Tem certeza que deseja excluir a tarefa "${deleteTaskTarget?.title}"?`}
      />
    </div>
  );
}
