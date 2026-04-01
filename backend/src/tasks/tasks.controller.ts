import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Priority, TaskStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { TasksService } from './tasks.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova tarefa' })
  @ApiResponse({ status: 201, description: 'Tarefa criada com sucesso' })
  @ApiResponse({ status: 404, description: 'Projeto nao encontrado' })
  create(
    @CurrentUser() user: { id: string; email: string },
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as tarefas do usuario' })
  @ApiResponse({ status: 200, description: 'Lista de tarefas' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: TaskStatus,
    description: 'Filtrar por status',
  })
  @ApiQuery({
    name: 'priority',
    required: false,
    enum: Priority,
    description: 'Filtrar por prioridade',
  })
  @ApiQuery({
    name: 'projectId',
    required: false,
    type: String,
    description: 'Filtrar por projeto',
  })
  findAll(
    @CurrentUser() user: { id: string; email: string },
    @Query('status') status?: TaskStatus,
    @Query('priority') priority?: Priority,
    @Query('projectId') projectId?: string,
  ) {
    return this.tasksService.findAll(user.id, { status, priority, projectId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter tarefa por ID' })
  @ApiResponse({ status: 200, description: 'Tarefa encontrada' })
  @ApiResponse({ status: 404, description: 'Tarefa nao encontrada' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; email: string },
  ) {
    return this.tasksService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar tarefa' })
  @ApiResponse({ status: 200, description: 'Tarefa atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Tarefa nao encontrada' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; email: string },
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover tarefa' })
  @ApiResponse({ status: 200, description: 'Tarefa removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Tarefa nao encontrada' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; email: string },
  ) {
    return this.tasksService.remove(id, user.id);
  }
}
