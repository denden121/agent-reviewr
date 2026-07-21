import { randomUUID } from 'node:crypto';
import type { Task, CreateTaskInput, UpdateTaskInput } from './types.js';

/**
 * Simple in-memory task store. Not persistent — data resets on restart.
 * Kept intentionally small so the domain logic is easy to reason about and test.
 */
export class TaskStore {
  private tasks = new Map<string, Task>();

  list(): Task[] {
    return [...this.tasks.values()].sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt),
    );
  }

  get(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  create(input: CreateTaskInput): Task {
    const title = input.title.trim();
    if (!title) {
      throw new ValidationError('title is required');
    }
    const task: Task = {
      id: randomUUID(),
      title,
      done: false,
      createdAt: new Date().toISOString(),
    };
    this.tasks.set(task.id, task);
    return task;
  }

  update(id: string, input: UpdateTaskInput): Task | undefined {
    const existing = this.tasks.get(id);
    if (!existing) return undefined;

    const next: Task = { ...existing };
    if (input.title !== undefined) {
      const title = input.title.trim();
      if (!title) {
        throw new ValidationError('title cannot be empty');
      }
      next.title = title;
    }
    if (input.done !== undefined) {
      next.done = input.done;
    }
    this.tasks.set(id, next);
    return next;
  }

  remove(id: string): boolean {
    return this.tasks.delete(id);
  }

  clear(): void {
    this.tasks.clear();
  }
}

export class ValidationError extends Error {}
