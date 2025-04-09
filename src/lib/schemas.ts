import { z } from 'zod';
import { priorityEnum } from '@/db/schema'; // Adjust path if necessary

// --- Create Task Schema --- 
export const createTaskSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(256, "Título muito longo"),
  description: z.string().optional(),
  priority: z.enum(priorityEnum.enumValues),
  dueDate: z.date().optional(),
  tags: z.string().optional(),
});
export type CreateTaskInput = z.infer<typeof createTaskSchema>;

// --- Update Task Schema --- 
export const updateTaskSchema = createTaskSchema.extend({
  id: z.number(), // Add id for identifying the task to update
});
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>; 