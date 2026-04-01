'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { Project } from '@/types';
import { ProjectModal } from '@/components/project-modal';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Plus, Trash2, Pencil, Folder, Calendar } from 'lucide-react';

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const router = useRouter();

  const fetchProjects = useCallback(async () => {
    try {
      const data = await api.projects.list();
      setProjects(data);
    } catch (err) {
      console.error('Erro ao carregar projetos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async (data: {
    title: string;
    description?: string;
    color: string;
  }) => {
    await api.projects.create(data);
    await fetchProjects();
  };

  const handleEditProject = async (data: {
    title: string;
    description?: string;
    color: string;
  }) => {
    if (!editingProject) return;
    await api.projects.update(editingProject.id, data);
    setEditingProject(undefined);
    await fetchProjects();
  };

  const handleDeleteProject = async () => {
    if (!deleteTarget) return;
    await api.projects.delete(deleteTarget.id);
    setDeleteTarget(null);
    await fetchProjects();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Skeleton de carregamento
  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
          <div className="h-10 w-32 bg-muted rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-muted rounded-lg p-4 border border-border h-40 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Meus Projetos</h1>
        <button
          onClick={() => {
            setEditingProject(undefined);
            setProjectModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Projeto
        </button>
      </div>

      {/* Empty state */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Folder className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Nenhum projeto ainda
          </h2>
          <p className="text-muted-foreground mb-6">
            Crie seu primeiro projeto para comecar a organizar suas tarefas!
          </p>
          <button
            onClick={() => {
              setEditingProject(undefined);
              setProjectModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Criar Projeto
          </button>
        </div>
      ) : (
        /* Project grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-muted rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer group relative overflow-hidden"
              onClick={() => router.push(`/dashboard/projects/${project.id}`)}
            >
              {/* Barra de cor no topo */}
              <div
                className="h-1.5 w-full"
                style={{ backgroundColor: project.color }}
              />

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-foreground line-clamp-1">
                    {project.title}
                  </h3>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingProject(project);
                        setProjectModalOpen(true);
                      }}
                      className="p-1.5 rounded-md hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Editar projeto"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(project);
                      }}
                      className="p-1.5 rounded-md hover:bg-background text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Excluir projeto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {project.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {project.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(project.createdAt)}
                  </span>
                  {project._count && (
                    <span className="bg-background px-2 py-0.5 rounded-full">
                      {project._count.tasks}{' '}
                      {project._count.tasks === 1 ? 'tarefa' : 'tarefas'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de criar/editar projeto */}
      <ProjectModal
        isOpen={projectModalOpen}
        onClose={() => {
          setProjectModalOpen(false);
          setEditingProject(undefined);
        }}
        onSubmit={editingProject ? handleEditProject : handleCreateProject}
        project={editingProject}
      />

      {/* Dialogo de confirmacao de exclusao */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteProject}
        title="Excluir Projeto"
        message={`Tem certeza que deseja excluir o projeto "${deleteTarget?.title}"? Todas as tarefas associadas serao removidas.`}
      />
    </div>
  );
}
