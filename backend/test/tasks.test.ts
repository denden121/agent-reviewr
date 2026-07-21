import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { TaskStore } from '../src/store.js';

describe('Tasks API', () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    app = createApp(new TaskStore());
  });

  it('reports health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('starts with an empty task list', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('creates a task', async () => {
    const res = await request(app).post('/api/tasks').send({ title: 'Write tests' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: 'Write tests', done: false });
    expect(res.body.id).toBeTruthy();
  });

  it('rejects an empty title with 400', async () => {
    const res = await request(app).post('/api/tasks').send({ title: '   ' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/title/);
  });

  it('toggles a task done', async () => {
    const created = await request(app).post('/api/tasks').send({ title: 'Ship it' });
    const id = created.body.id;

    const patched = await request(app).patch(`/api/tasks/${id}`).send({ done: true });
    expect(patched.status).toBe(200);
    expect(patched.body.done).toBe(true);
  });

  it('returns 404 when updating a missing task', async () => {
    const res = await request(app).patch('/api/tasks/does-not-exist').send({ done: true });
    expect(res.status).toBe(404);
  });

  it('clears completed tasks', async () => {
    const a = await request(app).post('/api/tasks').send({ title: 'a' });
    await request(app).post('/api/tasks').send({ title: 'b' });
    await request(app).patch(`/api/tasks/${a.body.id}`).send({ done: true });

    const res = await request(app).post('/api/tasks/clear-completed');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ cleared: 1 });

    const list = await request(app).get('/api/tasks');
    expect(list.body).toHaveLength(1);
    expect(list.body[0].title).toBe('b');
  });

  it('deletes a task', async () => {
    const created = await request(app).post('/api/tasks').send({ title: 'Delete me' });
    const id = created.body.id;

    const del = await request(app).delete(`/api/tasks/${id}`);
    expect(del.status).toBe(204);

    const after = await request(app).get(`/api/tasks/${id}`);
    expect(after.status).toBe(404);
  });
});
