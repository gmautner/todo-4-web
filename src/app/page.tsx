import { db } from '@/db';
import { tasks } from '@/db/schema';
import { asc, desc } from 'drizzle-orm';
import { NewTaskForm } from '@/components/new-task-form';
import { TaskList } from '@/components/task-list';
import { toggleTaskStatus, deleteTask } from '@/app/actions';

// Keep dynamic export
export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch tasks (Server Component part - runs at request time due to force-dynamic)
  const allTasks = await db.select().from(tasks).orderBy(
    asc(tasks.status),
    desc(tasks.priority),
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
