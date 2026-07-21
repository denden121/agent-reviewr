import { useEffect, useState } from 'react';
import { api, type Task } from './api.js';
import { TaskList } from './TaskList.js';

export function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .listTasks()
      .then(setTasks)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    try {
      const task = await api.createTask(trimmed);
      setTasks((prev) => [...prev, task]);
      setTitle('');
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleToggle(task: Task) {
    try {
      const updated = await api.toggleTask(task.id, !task.done);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleDelete(task: Task) {
    try {
      await api.deleteTask(task.id);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleClearCompleted() {
    await api.clearCompleted();
    setTasks((prev) => prev.filter((t) => !t.done));
  }

  const remaining = tasks.filter((t) => !t.done).length;
  const hasCompleted = tasks.some((t) => t.done);

  return (
    <main className="container">
      <h1>Tasks</h1>
      <p className="subtitle">{remaining} remaining</p>

      <form className="add-form" onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="What needs doing?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="New task title"
        />
        <button type="submit">Add</button>
      </form>

      {error && <p className="error" role="alert">{error}</p>}

      {loading ? (
        <p className="empty">Loading…</p>
      ) : (
        <TaskList tasks={tasks} onToggle={handleToggle} onDelete={handleDelete} />
      )}

      {hasCompleted && (
        <button className="clear-completed" onClick={handleClearCompleted}>
          Clear completed
        </button>
      )}
    </main>
  );
}
