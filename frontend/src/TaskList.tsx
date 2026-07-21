import type { Task } from './api.js';

interface TaskListProps {
  tasks: Task[];
  onToggle: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskList({ tasks, onToggle, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return <p className="empty">No tasks yet. Add one above.</p>;
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <li key={task.id} className={task.done ? 'task done' : 'task'}>
          <label>
            <input
              type="checkbox"
              checked={task.done}
              onChange={() => onToggle(task)}
            />
            <span>{task.title}</span>
          </label>
          <button
            className="delete"
            aria-label={`Delete ${task.title}`}
            onClick={() => onDelete(task)}
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
}
