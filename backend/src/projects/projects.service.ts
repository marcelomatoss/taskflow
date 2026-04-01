import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private getCacheKey(userId: string) {
    return `projects:${userId}`;
  }

  async create(userId: string, dto: CreateProjectDto) {
    const project = await this.prisma.project.create({
      data: {
        title: dto.title,
        description: dto.description,
        color: dto.color,
        userId,
      },
    });
    await this.cacheManager.del(this.getCacheKey(userId));
    return project;
  }

  async findAll(userId: string) {
    const cacheKey = this.getCacheKey(userId);
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const projects = await this.prisma.project.findMany({
      where: { userId },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    await this.cacheManager.set(cacheKey, projects, 30000);
    return projects;
  }

  async findOne(id: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, userId },
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Projeto nao encontrado');
    }

    return project;
  }

  async update(id: string, userId: string, dto: UpdateProjectDto) {
    await this.findOne(id, userId);

    const project = await this.prisma.project.update({
      where: { id },
      data: dto,
    });
    await this.cacheManager.del(this.getCacheKey(userId));
    return project;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    const project = await this.prisma.project.delete({
      where: { id },
    });
    await this.cacheManager.del(this.getCacheKey(userId));
    return project;
  }
}
