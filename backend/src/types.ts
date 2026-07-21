export interface Task {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
}

export interface CreateTaskInput {
  title: string;
}

export interface UpdateTaskInput {
  title?: string;
  done?: boolean;
}
