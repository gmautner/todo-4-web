'use server'; // Mark this component as a Server Component by default

import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { tasks } from '@/db/schema';
import { eq, asc, desc } from 'drizzle-orm';
import { NewTaskForm } from '@/components/new-task-form';
import { TaskList } from '@/components/task-list';

// Force dynamic rendering to prevent DB access during build
export const dynamic = 'force-dynamic';

// Server Action to toggle task status
async function toggleTaskStatus(id: number, currentStatus: boolean) {
  'use server'; // Mark this function as a Server Action
  try {
    await db.update(tasks)
      .set({ status: !currentStatus, updatedAt: new Date() })
      .where(eq(tasks.id, id));
    revalidatePath('/'); // Revalidate the page to show the change
  } catch (error) {
    console.error("Failed to toggle task status:", error);
    // Handle error appropriately in a real app (e.g., show a toast)
  }
}

// Server Action to delete a task
async function deleteTask(id: number) {
  'use server'; // Mark this function as a Server Action
  try {
    await db.delete(tasks).where(eq(tasks.id, id));
    revalidatePath('/'); // Revalidate the page to show the change
  } catch (error) {
    console.error("Failed to delete task:", error);
    // Handle error appropriately
  }
}

export default async function Home() {
  // Fetch tasks from the database
  // Order by status (pending first), then priority (high first), then creation date
  const allTasks = await db.select().from(tasks).orderBy(
    asc(tasks.status), // false (pending) comes before true (completed)
    desc(tasks.priority), // 'high' comes first
    desc(tasks.createdAt)
  );

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Minha Lista de Tarefas</h1>
        <NewTaskForm />
      </div>

      <TaskList 
        initialTasks={allTasks} 
        toggleTaskStatusAction={toggleTaskStatus} 
        deleteTaskAction={deleteTask} 
      />
    </main>
  );
}
