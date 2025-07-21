import { create } from 'zustand';
import { Todo } from '@/app/types/todo';
import api from '@/app/lib/supabase/api';

interface TodoStore {
  todos: Todo[];
  isLoading: boolean;
  error: string | null;
  fetchTodos: () => Promise<void>;
  addTodo: (todo: Omit<Todo, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
}

const useStore = create<TodoStore>((set, get) => ({
  todos: [],
  isLoading: false,
  error: null,

  fetchTodos: async () => {
    set({ isLoading: true, error: null });
    try {
      const todos = await api.getTodos();
      set({ todos, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch todos';
      set({ error: errorMessage, isLoading: false });
    }
  },

  addTodo: async (todo) => {
    set({ isLoading: true, error: null });
    try {
      const newTodo = await api.createTodo(todo);
      set((state) => ({ 
        todos: [newTodo, ...state.todos], 
        isLoading: false 
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add todo';
      set({ error: errorMessage, isLoading: false });
    }
  },

  updateTodo: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTodo = await api.updateTodo(id, updates);
      set((state) => ({
        todos: state.todos.map((todo) =>
          todo.id === id ? updatedTodo : todo
        ),
        isLoading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update todo';
      set({ error: errorMessage, isLoading: false });
    }
  },

  deleteTodo: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.deleteTodo(id);
      set((state) => ({
        todos: state.todos.filter((todo) => todo.id !== id),
        isLoading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete todo';
      set({ error: errorMessage, isLoading: false });
    }
  },
}));

export default useStore; 