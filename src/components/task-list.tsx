'use client';

import { useState } from 'react';
import type { tasks } from "@/db/schema";
import { TaskItem } from '@/components/task-item';
import { EditTaskForm } from '@/components/edit-task-form';

// Define the expected shape of the action response
interface ActionResponse { success: boolean; message?: string; }

// Removed unused declare const placeholders
// declare const toggleTaskStatus: ...
// declare const deleteTask: ...

type TaskSelect = typeof tasks.$inferSelect;

interface TaskListProps {
  initialTasks: TaskSelect[];
  // Update prop types to match the actual return type of the actions
  toggleTaskStatusAction: (id: number, currentStatus: boolean) => Promise<ActionResponse>; 
  deleteTaskAction: (id: number) => Promise<ActionResponse>;
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

  // Define wrapper functions to handle potential errors from actions
  // (Could also show toasts here based on the response)
  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
     try {
       await toggleTaskStatusAction(id, currentStatus);
       // Optional: show success toast or handle optimistic update
     } catch (error) {
        console.error("Error toggling status:", error);
        // Optional: show error toast
     }
  };

  const handleDelete = async (id: number) => {
     try {
       await deleteTaskAction(id);
       // Optional: show success toast or handle optimistic update
     } catch (error) {
        console.error("Error deleting task:", error);
        // Optional: show error toast
     }
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
            onToggleStatus={handleToggleStatus} // Pass wrapper function
            onDelete={handleDelete}         // Pass wrapper function
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