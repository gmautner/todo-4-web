'use client';

import { useState } from 'react';
import type { tasks } from "@/db/schema";
import { TaskItem } from '@/components/task-item';
import { EditTaskForm } from '@/components/edit-task-form';

// Removed unused declare const placeholders
// declare const toggleTaskStatus: ...
// declare const deleteTask: ...

type TaskSelect = typeof tasks.$inferSelect;

interface TaskListProps {
  initialTasks: TaskSelect[];
  toggleTaskStatusAction: (id: number, currentStatus: boolean) => Promise<void>; 
  deleteTaskAction: (id: number) => Promise<void>;
}

export function TaskList({ initialTasks, toggleTaskStatusAction, deleteTaskAction }: TaskListProps) {
  // Removed unused state for tasks/setTasks
  // const [tasks, setTasks] = useState(initialTasks);
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
            onToggleStatus={toggleTaskStatusAction}
            onDelete={deleteTaskAction}
            onEdit={handleEditClick}
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