import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Prisma, Priority, TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private getCacheKey(userId: string) {
    return `tasks:${userId}`;
  }

  private async invalidateCache(userId: string) {
    await this.cacheManager.del(this.getCacheKey(userId));
  }

  async create(userId: string, dto: CreateTaskDto) {
    // Verificar se o projeto pertence ao usuario
    const project = await this.prisma.project.findFirst({
      where: { id: dto.projectId, userId },
    });

    if (!project) {
      throw new NotFoundException('Projeto nao encontrado');
    }

    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        projectId: dto.projectId,
        userId,
      },
      include: {
        project: {
          select: { id: true, title: true },
        },
      },
    });
    await this.invalidateCache(userId);
    return task;
  }

  async findAll(
    userId: string,
    filters?: { status?: TaskStatus; priority?: Priority; projectId?: string },
  ) {
    const where: Prisma.TaskWhereInput = { userId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.priority) {
      where.priority = filters.priority;
    }

    if (filters?.projectId) {
      where.projectId = filters.projectId;
    }

    // Cache somente quando nao ha filtros (listagem padrao)
    const hasFilters =
      filters?.status || filters?.priority || filters?.projectId;
    if (!hasFilters) {
      const cacheKey = this.getCacheKey(userId);
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) return cached;

      const tasks = await this.prisma.task.findMany({
        where,
        include: {
          project: {
            select: { id: true, title: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      await this.cacheManager.set(cacheKey, tasks, 30000);
      return tasks;
    }

    return this.prisma.task.findMany({
      where,
      include: {
        project: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, userId },
      include: {
        project: {
          select: { id: true, title: true },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Tarefa nao encontrada');
    }

    return task;
  }

  async update(id: string, userId: string, dto: UpdateTaskDto) {
    await this.findOne(id, userId);

    // Se projectId foi informado, verificar se pertence ao usuario
    if (dto.projectId) {
      const project = await this.prisma.project.findFirst({
        where: { id: dto.projectId, userId },
      });

      if (!project) {
        throw new NotFoundException('Projeto nao encontrado');
      }
    }

    const data: Prisma.TaskUpdateInput = {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.priority !== undefined && { priority: dto.priority }),
      ...(dto.dueDate !== undefined && { dueDate: new Date(dto.dueDate) }),
      ...(dto.projectId !== undefined && {
        project: { connect: { id: dto.projectId } },
      }),
    };

    const task = await this.prisma.task.update({
      where: { id },
      data,
      include: {
        project: {
          select: { id: true, title: true },
        },
      },
    });
    await this.invalidateCache(userId);
    return task;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    const task = await this.prisma.task.delete({
      where: { id },
    });
    await this.invalidateCache(userId);
    return task;
  }
}
