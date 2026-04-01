import { PrismaClient, TaskStatus, Priority } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as bcrypt from 'bcrypt';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://taskflow:taskflow123@localhost:5432/taskflow?schema=public';

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Limpar dados existentes
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Criar usuário 1 - João Silva
  const joao = await prisma.user.create({
    data: {
      name: 'João Silva',
      email: 'joao@example.com',
      password: hashedPassword,
    },
  });

  // Criar usuário 2 - Maria Santos
  const maria = await prisma.user.create({
    data: {
      name: 'Maria Santos',
      email: 'maria@example.com',
      password: hashedPassword,
    },
  });

  // Projetos do João
  const projectJoao1 = await prisma.project.create({
    data: {
      title: 'Website Redesign',
      description: 'Redesenhar o site principal da empresa',
      color: '#6366f1',
      userId: joao.id,
    },
  });

  const projectJoao2 = await prisma.project.create({
    data: {
      title: 'App Mobile',
      description: 'Desenvolver aplicativo mobile para clientes',
      color: '#f59e0b',
      userId: joao.id,
    },
  });

  // Projetos da Maria
  const projectMaria1 = await prisma.project.create({
    data: {
      title: 'Sistema de Inventário',
      description: 'Sistema de controle de estoque',
      color: '#10b981',
      userId: maria.id,
    },
  });

  const projectMaria2 = await prisma.project.create({
    data: {
      title: 'Dashboard Analytics',
      description: 'Painel de análise de dados',
      color: '#ef4444',
      userId: maria.id,
    },
  });

  // Tasks do João - Projeto 1
  await prisma.task.createMany({
    data: [
      {
        title: 'Criar wireframes',
        description: 'Desenhar wireframes de todas as páginas',
        status: TaskStatus.DONE,
        priority: Priority.HIGH,
        dueDate: new Date('2026-04-10'),
        projectId: projectJoao1.id,
        userId: joao.id,
      },
      {
        title: 'Implementar header responsivo',
        description: 'Header com menu hamburger para mobile',
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        dueDate: new Date('2026-04-15'),
        projectId: projectJoao1.id,
        userId: joao.id,
      },
      {
        title: 'Criar página de contato',
        description: 'Formulário com validação',
        status: TaskStatus.TODO,
        priority: Priority.MEDIUM,
        dueDate: new Date('2026-04-20'),
        projectId: projectJoao1.id,
        userId: joao.id,
      },
      {
        title: 'Otimizar imagens',
        description: 'Comprimir e converter para WebP',
        status: TaskStatus.TODO,
        priority: Priority.LOW,
        dueDate: new Date('2026-04-25'),
        projectId: projectJoao1.id,
        userId: joao.id,
      },
    ],
  });

  // Tasks do João - Projeto 2
  await prisma.task.createMany({
    data: [
      {
        title: 'Configurar React Native',
        description: 'Setup inicial do projeto',
        status: TaskStatus.DONE,
        priority: Priority.HIGH,
        dueDate: new Date('2026-04-05'),
        projectId: projectJoao2.id,
        userId: joao.id,
      },
      {
        title: 'Tela de login',
        description: 'Implementar autenticação com biometria',
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        dueDate: new Date('2026-04-12'),
        projectId: projectJoao2.id,
        userId: joao.id,
      },
      {
        title: 'Push notifications',
        description: 'Integrar Firebase Cloud Messaging',
        status: TaskStatus.TODO,
        priority: Priority.MEDIUM,
        dueDate: new Date('2026-04-22'),
        projectId: projectJoao2.id,
        userId: joao.id,
      },
    ],
  });

  // Tasks da Maria - Projeto 1
  await prisma.task.createMany({
    data: [
      {
        title: 'Modelar banco de dados',
        description: 'Criar schema do banco para inventário',
        status: TaskStatus.DONE,
        priority: Priority.HIGH,
        dueDate: new Date('2026-04-08'),
        projectId: projectMaria1.id,
        userId: maria.id,
      },
      {
        title: 'CRUD de produtos',
        description: 'Endpoints de criação, leitura, atualização e exclusão',
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        dueDate: new Date('2026-04-14'),
        projectId: projectMaria1.id,
        userId: maria.id,
      },
      {
        title: 'Relatórios de estoque',
        description: 'Gerar relatórios em PDF',
        status: TaskStatus.TODO,
        priority: Priority.MEDIUM,
        dueDate: new Date('2026-04-20'),
        projectId: projectMaria1.id,
        userId: maria.id,
      },
      {
        title: 'Integrar código de barras',
        description: 'Leitura de código de barras para entrada de produtos',
        status: TaskStatus.TODO,
        priority: Priority.LOW,
        dueDate: new Date('2026-04-28'),
        projectId: projectMaria1.id,
        userId: maria.id,
      },
    ],
  });

  // Tasks da Maria - Projeto 2
  await prisma.task.createMany({
    data: [
      {
        title: 'Definir KPIs',
        description: 'Listar indicadores-chave para o dashboard',
        status: TaskStatus.DONE,
        priority: Priority.HIGH,
        dueDate: new Date('2026-04-06'),
        projectId: projectMaria2.id,
        userId: maria.id,
      },
      {
        title: 'Gráficos com Chart.js',
        description: 'Implementar gráficos de linha e barra',
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.MEDIUM,
        dueDate: new Date('2026-04-16'),
        projectId: projectMaria2.id,
        userId: maria.id,
      },
      {
        title: 'Filtros por período',
        description: 'Adicionar date picker para filtrar dados',
        status: TaskStatus.TODO,
        priority: Priority.MEDIUM,
        dueDate: new Date('2026-04-22'),
        projectId: projectMaria2.id,
        userId: maria.id,
      },
    ],
  });

  console.log('Seed executado com sucesso!');
  console.log(`Usuários criados: ${joao.name}, ${maria.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
