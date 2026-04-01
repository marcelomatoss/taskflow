import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ProjectsService } from './projects.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

const mockProject = {
  id: 'project-1',
  title: 'Test Project',
  description: 'A test project',
  color: '#FF0000',
  userId: 'user-1',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const mockProjectWithTasks = {
  ...mockProject,
  tasks: [
    {
      id: 'task-1',
      title: 'Task 1',
      description: 'A task',
      status: 'TODO',
      priority: 'MEDIUM',
      projectId: 'project-1',
      userId: 'user-1',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    },
  ],
};

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prisma: {
    project: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      project: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn().mockResolvedValue(undefined),
            del: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  describe('create', () => {
    it('should create a project', async () => {
      const dto = {
        title: 'Test Project',
        description: 'A test project',
        color: '#FF0000',
      };
      prisma.project.create.mockResolvedValue(mockProject);

      const result = await service.create('user-1', dto);

      expect(prisma.project.create).toHaveBeenCalledWith({
        data: {
          title: dto.title,
          description: dto.description,
          color: dto.color,
          userId: 'user-1',
        },
      });
      expect(result).toEqual(mockProject);
    });
  });

  describe('findAll', () => {
    it('should return all projects for user', async () => {
      const projectsWithCount = [{ ...mockProject, _count: { tasks: 1 } }];
      prisma.project.findMany.mockResolvedValue(projectsWithCount);

      const result = await service.findAll('user-1');

      expect(prisma.project.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: {
          _count: {
            select: { tasks: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(projectsWithCount);
    });
  });

  describe('findOne', () => {
    it('should return project with tasks', async () => {
      prisma.project.findFirst.mockResolvedValue(mockProjectWithTasks);

      const result = await service.findOne('project-1', 'user-1');

      expect(prisma.project.findFirst).toHaveBeenCalledWith({
        where: { id: 'project-1', userId: 'user-1' },
        include: {
          tasks: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });
      expect(result).toEqual(mockProjectWithTasks);
    });

    it('should throw NotFoundException if project not found', async () => {
      prisma.project.findFirst.mockResolvedValue(null);

      await expect(service.findOne('non-existent', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a project', async () => {
      const dto = { title: 'Updated Title' };
      const updatedProject = { ...mockProject, title: 'Updated Title' };

      // findOne is called first to verify ownership
      prisma.project.findFirst.mockResolvedValue(mockProjectWithTasks);
      prisma.project.update.mockResolvedValue(updatedProject);

      const result = await service.update('project-1', 'user-1', dto);

      expect(prisma.project.findFirst).toHaveBeenCalledWith({
        where: { id: 'project-1', userId: 'user-1' },
        include: {
          tasks: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });
      expect(prisma.project.update).toHaveBeenCalledWith({
        where: { id: 'project-1' },
        data: dto,
      });
      expect(result).toEqual(updatedProject);
    });
  });

  describe('remove', () => {
    it('should delete a project', async () => {
      // findOne is called first to verify ownership
      prisma.project.findFirst.mockResolvedValue(mockProjectWithTasks);
      prisma.project.delete.mockResolvedValue(mockProject);

      const result = await service.remove('project-1', 'user-1');

      expect(prisma.project.findFirst).toHaveBeenCalled();
      expect(prisma.project.delete).toHaveBeenCalledWith({
        where: { id: 'project-1' },
      });
      expect(result).toEqual(mockProject);
    });
  });
});
