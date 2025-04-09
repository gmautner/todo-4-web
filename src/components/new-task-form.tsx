'use client';

import { useState, useTransition } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createTask } from '@/app/actions';
import { createTaskSchema } from '@/lib/schemas';

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { PlusCircle } from 'lucide-react';

type FormValues = z.infer<typeof createTaskSchema>;

export function NewTaskForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: 'medium',
      dueDate: undefined,
      tags: "",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    startTransition(async () => {
      const result = await createTask(values);

      if (result.success) {
        form.reset();
        setIsOpen(false);
        toast.success("Tarefa criada com sucesso.");
      } else {
        toast.error(result.message || "Falha ao criar tarefa.");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Nova Tarefa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Tarefa</DialogTitle>
          <DialogDescription>
            Preencha os detalhes da sua nova tarefa.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Título
            </Label>
            <Input
              id="title"
              {...form.register("title")}
              className="col-span-3"
            />
            {form.formState.errors.title && (
              <p role="alert" className="col-span-4 text-sm text-red-600 text-right">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Descrição
            </Label>
            <Textarea
              id="description"
              {...form.register("description")}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="priority" className="text-right">
              Prioridade
            </Label>
            <Controller
              control={form.control}
              name="priority"
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger id="priority" className="col-span-3">
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
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

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dueDate" className="text-right">
              Vencimento
            </Label>
            <Controller
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <DatePicker
                  date={field.value}
                  setDate={field.onChange}
                  className="col-span-3"
                />
              )}
            />
            {form.formState.errors.dueDate && (
              <p role="alert" className="col-span-4 text-sm text-red-600 text-right">{form.formState.errors.dueDate.message}</p>
            )}
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tags" className="text-right">
              Tags
            </Label>
            <Input
              id="tags"
              placeholder="Trabalho, Pessoal (separadas por vírgula)"
              {...form.register("tags")}
              className="col-span-3"
            />
            {form.formState.errors.tags && (
              <p role="alert" className="col-span-4 text-sm text-red-600 text-right">{form.formState.errors.tags.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar Tarefa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 