'use client';

import { useTransition, useEffect } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateTask } from '@/app/actions'; // Action only
import { updateTaskSchema } from '@/lib/schemas'; // Schema from lib
import type { tasks } from "@/db/schema";
// import { priorityEnum } from '@/db/schema'; // No longer needed here directly

// Shadcn UI components
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  // DialogTrigger, // Trigger will be managed outside
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner"

// Define type using z.infer from the update schema
type FormValues = z.infer<typeof updateTaskSchema>;

type TaskSelect = typeof tasks.$inferSelect; // Alias for readability

interface EditTaskFormProps {
  task: TaskSelect | null; // Task to edit, or null if none
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTaskForm({ task, isOpen, onOpenChange }: EditTaskFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(updateTaskSchema),
    // Default values will be set by reset() in useEffect
  });

  // Reset form with task data when the task prop changes or dialog opens
  useEffect(() => {
    if (task && isOpen) {
      form.reset({
        id: task.id,
        title: task.title,
        description: task.description ?? "",
        priority: task.priority ?? 'medium',
        // Ensure dueDate is a Date object or undefined for the DatePicker
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        tags: task.tags ?? "",
      });
    } else if (!isOpen) {
        // Optionally clear form when closed if not editing
        form.reset({});
    }
  }, [task, isOpen, form]);

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    startTransition(async () => {
      // Ensure we have the task id before proceeding
      if (!values.id) {
        toast.error("ID da tarefa não encontrado.");
        return;
      }
      const result = await updateTask(values); // Call updateTask

      if (result.success) {
        onOpenChange(false); // Close dialog on success
        toast.success("Tarefa atualizada com sucesso.");
      } else {
        toast.error(result.message || "Falha ao atualizar tarefa.");
      }
    });
  };

  // Don't render the form if no task is selected
  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {/* DialogTrigger is now handled by the parent component */}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Tarefa</DialogTitle>
          <DialogDescription>
            Modifique os detalhes da tarefa selecionada.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          {/* Hidden input for ID - not strictly needed as it's in form state */}
          {/* <input type="hidden" {...form.register("id")} /> */}

          {/* Title Input */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-title" className="text-right">Título</Label>
            <Input id="edit-title" {...form.register("title")} className="col-span-3" />
            {form.formState.errors.title && (
              <p role="alert" className="col-span-4 text-sm text-red-600 text-right">{form.formState.errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-description" className="text-right">Descrição</Label>
            <Textarea id="edit-description" {...form.register("description")} className="col-span-3" />
          </div>

          {/* Priority Controller */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-priority" className="text-right">Prioridade</Label>
            <Controller
              control={form.control}
              name="priority"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}> {/* Use value instead of defaultValue */}
                  <SelectTrigger id="edit-priority" className="col-span-3"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.priority && (
              <p role="alert" className="col-span-4 text-sm text-red-600 text-right">{form.formState.errors.priority.message}</p>
            )}
          </div>

          {/* Due Date Controller */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-dueDate" className="text-right">Vencimento</Label>
            <Controller
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <DatePicker date={field.value} setDate={field.onChange} className="col-span-3" />
              )}
            />
            {form.formState.errors.dueDate && (
              <p role="alert" className="col-span-4 text-sm text-red-600 text-right">{form.formState.errors.dueDate.message}</p>
            )}
          </div>

          {/* Tags Input */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-tags" className="text-right">Tags</Label>
            <Input id="edit-tags" placeholder="Trabalho, Pessoal" {...form.register("tags")} className="col-span-3" />
            {form.formState.errors.tags && (
              <p role="alert" className="col-span-4 text-sm text-red-600 text-right">{form.formState.errors.tags.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 