'use client';

import { createContext, useContext, useState, useCallback } from 'react';

export type Locale = 'pt-BR' | 'en';

// Define all translations
const translations = {
  'pt-BR': {
    // Common
    save: 'Salvar',
    cancel: 'Cancelar',
    delete: 'Excluir',
    edit: 'Editar',
    create: 'Criar',
    confirm: 'Confirmar',
    loading: 'Carregando...',
    saving: 'Salvando...',

    // Auth
    login: 'Entrar',
    register: 'Criar conta',
    email: 'E-mail',
    password: 'Senha',
    confirmPassword: 'Confirmar Senha',
    name: 'Nome',
    loginTitle: 'Entre na sua conta para continuar',
    registerTitle: 'Crie sua conta para começar',
    noAccount: 'Não tem uma conta?',
    hasAccount: 'Já tem uma conta?',
    registerLink: 'Criar conta',
    loginLink: 'Entrar',
    loggingIn: 'Entrando...',
    registering: 'Criando conta...',

    // Landing
    heroDescription:
      'Organize suas tarefas, gerencie projetos e aumente sua produtividade com o TaskFlow. Simples, rápido e eficiente.',
    getStarted: 'Começar agora',
    signIn: 'Entrar',

    // Dashboard
    myProjects: 'Meus Projetos',
    newProject: 'Novo Projeto',
    noProjects: 'Nenhum projeto ainda',
    noProjectsDesc:
      'Crie seu primeiro projeto para comecar a organizar suas tarefas!',
    createProject: 'Criar Projeto',
    task: 'tarefa',
    tasks: 'tarefas',

    // Project
    backToDashboard: 'Voltar ao Dashboard',
    editProject: 'Editar Projeto',
    newTask: 'Nova Tarefa',
    noTasks: 'Nenhuma tarefa',
    projectNotFound: 'Projeto nao encontrado.',

    // Kanban
    todo: 'A Fazer',
    inProgress: 'Em Progresso',
    done: 'Concluído',

    // Priority
    low: 'Baixa',
    medium: 'Média',
    high: 'Alta',

    // Modals
    projectTitleLabel: 'Titulo *',
    projectDescriptionLabel: 'Descricao',
    projectColorLabel: 'Cor',
    projectTitlePlaceholder: 'Nome do projeto',
    projectDescriptionPlaceholder: 'Descricao do projeto (opcional)',
    taskTitleLabel: 'Titulo *',
    taskDescriptionLabel: 'Descricao',
    taskStatusLabel: 'Status',
    taskPriorityLabel: 'Prioridade',
    taskDueDateLabel: 'Data de Entrega',
    taskTitlePlaceholder: 'Nome da tarefa',
    taskDescriptionPlaceholder: 'Descricao da tarefa (opcional)',
    createProjectTitle: 'Novo Projeto',
    editProjectTitle: 'Editar Projeto',
    createTaskTitle: 'Nova Tarefa',
    editTaskTitle: 'Editar Tarefa',

    // Confirm
    deleteProject: 'Excluir Projeto',
    deleteProjectMsg:
      'Tem certeza que deseja excluir o projeto "{name}"? Todas as tarefas associadas serao removidas.',
    deleteTask: 'Excluir Tarefa',
    deleteTaskMsg: 'Tem certeza que deseja excluir a tarefa "{name}"?',

    // Navbar
    darkMode: 'Modo Escuro',
    lightMode: 'Modo Claro',
    logout: 'Sair',

    // Aria labels
    ariaToggleTheme: 'Alternar tema',
    ariaLogout: 'Sair',
    ariaEditProject: 'Editar projeto',
    ariaDeleteProject: 'Excluir projeto',
    ariaDeleteTask: 'Excluir tarefa',
    ariaAddTaskIn: 'Adicionar tarefa em {column}',
  },
  en: {
    // Common
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    confirm: 'Confirm',
    loading: 'Loading...',
    saving: 'Saving...',

    // Auth
    login: 'Sign in',
    register: 'Sign up',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    name: 'Name',
    loginTitle: 'Sign in to your account',
    registerTitle: 'Create your account',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    registerLink: 'Sign up',
    loginLink: 'Sign in',
    loggingIn: 'Signing in...',
    registering: 'Creating account...',

    // Landing
    heroDescription:
      'Organize your tasks, manage projects and boost your productivity with TaskFlow. Simple, fast and efficient.',
    getStarted: 'Get Started',
    signIn: 'Sign in',

    // Dashboard
    myProjects: 'My Projects',
    newProject: 'New Project',
    noProjects: 'No projects yet',
    noProjectsDesc: 'Create your first project to start organizing your tasks!',
    createProject: 'Create Project',
    task: 'task',
    tasks: 'tasks',

    // Project
    backToDashboard: 'Back to Dashboard',
    editProject: 'Edit Project',
    newTask: 'New Task',
    noTasks: 'No tasks',
    projectNotFound: 'Project not found.',

    // Kanban
    todo: 'To Do',
    inProgress: 'In Progress',
    done: 'Done',

    // Priority
    low: 'Low',
    medium: 'Medium',
    high: 'High',

    // Modals
    projectTitleLabel: 'Title *',
    projectDescriptionLabel: 'Description',
    projectColorLabel: 'Color',
    projectTitlePlaceholder: 'Project name',
    projectDescriptionPlaceholder: 'Project description (optional)',
    taskTitleLabel: 'Title *',
    taskDescriptionLabel: 'Description',
    taskStatusLabel: 'Status',
    taskPriorityLabel: 'Priority',
    taskDueDateLabel: 'Due Date',
    taskTitlePlaceholder: 'Task name',
    taskDescriptionPlaceholder: 'Task description (optional)',
    createProjectTitle: 'New Project',
    editProjectTitle: 'Edit Project',
    createTaskTitle: 'New Task',
    editTaskTitle: 'Edit Task',

    // Confirm
    deleteProject: 'Delete Project',
    deleteProjectMsg:
      'Are you sure you want to delete the project "{name}"? All associated tasks will be removed.',
    deleteTask: 'Delete Task',
    deleteTaskMsg: 'Are you sure you want to delete the task "{name}"?',

    // Navbar
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    logout: 'Sign out',

    // Aria labels
    ariaToggleTheme: 'Toggle theme',
    ariaLogout: 'Sign out',
    ariaEditProject: 'Edit project',
    ariaDeleteProject: 'Delete project',
    ariaDeleteTask: 'Delete task',
    ariaAddTaskIn: 'Add task in {column}',
  },
} as const;

type TranslationKey = keyof (typeof translations)['pt-BR'];

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('locale') as Locale) || 'pt-BR';
    }
    return 'pt-BR';
  });

  const changeLocale = useCallback((newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem('locale', newLocale);
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string>) => {
      let text: string =
        translations[locale][key] || translations['pt-BR'][key] || key;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          text = text.replace(`{${k}}`, v);
        });
      }
      return text;
    },
    [locale],
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale: changeLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
