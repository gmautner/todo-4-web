'use client';

import { useState } from 'react';
import type { tasks } from "@/db/schema";
import { TaskItem } from '@/components/task-item';
import { EditTaskForm } from '@/components/edit-task-form';

// Server actions passed down from page.tsx or defined elsewhere
// These need to be passed as props if TaskList is used in multiple places
// For simplicity now, we assume they are available in the scope or passed.
// Ideally, define them in actions.ts and import/pass them.
declare const toggleTaskStatus: (id: number, currentStatus: boolean) => Promise<void>; 
declare const deleteTask: (id: number) => Promise<void>;

type TaskSelect = typeof tasks.$inferSelect;

interface TaskListProps {
  initialTasks: TaskSelect[];
  // Pass server actions as props if needed
  toggleTaskStatusAction: (id: number, currentStatus: boolean) => Promise<void>; 
  deleteTaskAction: (id: number) => Promise<void>;
}

export function TaskList({ initialTasks, toggleTaskStatusAction, deleteTaskAction }: TaskListProps) {
  const [tasks, setTasks] = useState(initialTasks); // Could manage tasks state here if needed for optimistic updates
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskSelect | null>(null);

  const handleEditClick = (task: TaskSelect) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  };

  // This function could be used for optimistic updates if setTasks was implemented
  // const handleTaskUpdated = (updatedTask: TaskSelect) => {
  //   setTasks(currentTasks => 
  //     currentTasks.map(t => t.id === updatedTask.id ? updatedTask : t)
  //   );
  // };

  return (
    <div className="space-y-4">
      {initialTasks.length > 0 ? (
        initialTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggleStatus={toggleTaskStatusAction} // Use passed action
            onDelete={deleteTaskAction}         // Use passed action
            onEdit={handleEditClick}          // Trigger edit dialog
          />
        ))
      ) : (
        <p className="text-center text-muted-foreground">Nenhuma tarefa encontrada.</p>
      )}

      {/* Edit Dialog - controlled by this component */}
      <EditTaskForm 
        task={editingTask} 
        isOpen={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
      />
    </div>
  );
} 