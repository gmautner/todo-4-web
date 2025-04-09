'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { tasks } from '@/db/schema';
import { eq } from 'drizzle-orm';
// Import only types and schemas needed for function signatures/validation
import { createTaskSchema, updateTaskSchema, type CreateTaskInput, type UpdateTaskInput } from '@/lib/schemas';

// Remove schema definitions from here
// export const createTaskSchema = ...
// export const updateTaskSchema = ...

// --- Create Task Action --- 
interface CreateTaskResponse { success: boolean; message?: string; }
export async function createTask(input: CreateTaskInput): Promise<CreateTaskResponse> {
  const validatedInput = createTaskSchema.safeParse(input); // Use imported schema
  if (!validatedInput.success) {
    const firstError = validatedInput.error.flatten().fieldErrors;
    const message = Object.values(firstError).flat()[0] || "Erro de validação.";
    console.error("Validation failed:", validatedInput.error.flatten());
    return { success: false, message };
  }
  const { title, description, priority, dueDate, tags } = validatedInput.data;
  try {
    await db.insert(tasks).values({
      title,
      description,
      priority,
      dueDate,
      tags: tags?.split(',').map((t: string) => t.trim()).filter(Boolean).join(',') || null,
    });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Failed to create task:", error);
    return { success: false, message: "Falha ao criar tarefa no banco de dados." };
  }
}

// --- Update Task Action --- 
interface UpdateTaskResponse { success: boolean; message?: string; }
export async function updateTask(input: UpdateTaskInput): Promise<UpdateTaskResponse> {
  const validatedInput = updateTaskSchema.safeParse(input); // Use imported schema
  if (!validatedInput.success) {
    const firstError = validatedInput.error.flatten().fieldErrors;
    const message = Object.values(firstError).flat()[0] || "Erro de validação.";
    console.error("Validation failed:", validatedInput.error.flatten());
    return { success: false, message };
  }
  const { id, title, description, priority, dueDate, tags } = validatedInput.data;
  try {
    const result = await db.update(tasks)
      .set({
        title,
        description,
        priority,
        dueDate,
        tags: tags?.split(',').map((t: string) => t.trim()).filter(Boolean).join(',') || null,
        updatedAt: new Date(), // Update the timestamp
      })
      .where(eq(tasks.id, id)); // Use eq() here

    // Optionally check if any row was actually updated
    // Drizzle's update doesn't directly return the number of affected rows easily across drivers
    // For simplicity, we assume success if no error is thrown

    revalidatePath('/');
    return { success: true };

  } catch (error) {
    console.error("Failed to update task:", error);
    return { success: false, message: "Falha ao atualizar tarefa no banco de dados." };
  }
} 