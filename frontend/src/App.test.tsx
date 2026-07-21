import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { App } from './App.js';
import type { Task } from './api.js';

function mockFetchSequence(handlers: Array<() => Partial<Response> & { json: () => Promise<unknown> }>) {
  let call = 0;
  vi.stubGlobal(
    'fetch',
    vi.fn(() => {
      const handler = handlers[Math.min(call, handlers.length - 1)];
      call += 1;
      return Promise.resolve(handler() as Response);
    }),
  );
}

describe('App', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders tasks fetched from the API', async () => {
    const tasks: Task[] = [
      { id: '1', title: 'Buy milk', done: false, createdAt: '2020-01-01' },
    ];
    mockFetchSequence([() => ({ ok: true, json: () => Promise.resolve(tasks) })]);

    render(<App />);

    expect(await screen.findByText('Buy milk')).toBeInTheDocument();
  });

  it('adds a task through the form', async () => {
    const created: Task = { id: '2', title: 'New task', done: false, createdAt: '2020-01-02' };
    mockFetchSequence([
      () => ({ ok: true, json: () => Promise.resolve([]) }), // initial list
      () => ({ ok: true, json: () => Promise.resolve(created) }), // create
    ]);

    render(<App />);
    await waitFor(() => expect(screen.getByText('No tasks yet. Add one above.')).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText('New task title'), {
      target: { value: 'New task' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(await screen.findByText('New task')).toBeInTheDocument();
  });
});
