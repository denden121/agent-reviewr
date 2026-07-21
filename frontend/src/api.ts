export interface Task {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
}

const BASE = '/api';

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `request failed with ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  listTasks: () => fetch(`${BASE}/tasks`).then((r) => json<Task[]>(r)),

  createTask: (title: string) =>
    fetch(`${BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    }).then((r) => json<Task>(r)),

  toggleTask: (id: string, done: boolean) =>
    fetch(`${BASE}/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done }),
    }).then((r) => json<Task>(r)),

  deleteTask: (id: string) =>
    fetch(`${BASE}/tasks/${id}`, { method: 'DELETE' }).then((r) => {
      if (!r.ok) throw new Error(`delete failed with ${r.status}`);
    }),
};
