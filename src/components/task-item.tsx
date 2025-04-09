import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { tasks } from "@/db/schema"; // Import the type from schema
import { format } from 'date-fns'; // For formatting date
import { ptBR } from 'date-fns/locale'; // For Brazilian Portuguese date format
import { Pencil } from 'lucide-react'; // Import Pencil icon

type TaskSelect = typeof tasks.$inferSelect; // Alias

interface TaskItemProps {
  task: TaskSelect;
  onToggleStatus: (id: number, currentStatus: boolean) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onEdit: (task: TaskSelect) => void; // Add onEdit prop
}

// Helper to map priority to Badge variant
const priorityVariantMap = {
  low: 'secondary',
  medium: 'outline',
  high: 'destructive',
} as const;

export function TaskItem({ task, onToggleStatus, onDelete, onEdit }: TaskItemProps) {
  const handleToggle = () => {
    onToggleStatus(task.id, task.status);
  };

  const handleDelete = () => {
    onDelete(task.id);
  };

  const handleEdit = () => {
    onEdit(task); // Call onEdit with the task data
  };

  return (
    <Card className={`transition-opacity ${task.status ? 'opacity-50' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center space-x-3">
          <Checkbox
            id={`task-${task.id}`}
            checked={task.status}
            onCheckedChange={handleToggle}
            aria-label={task.status ? "Marcar como pendente" : "Marcar como concluída"}
          />
          <CardTitle className={`text-lg ${task.status ? 'line-through' : ''}`}>
            {task.title}
          </CardTitle>
        </div>
        <Badge variant={priorityVariantMap[task.priority ?? 'medium']}>
          {task.priority === 'low' ? 'Baixa' : task.priority === 'medium' ? 'Média' : 'Alta'}
        </Badge>
      </CardHeader>
      <CardContent className="pb-4">
        {task.description && (
          <p className={`text-sm text-muted-foreground ${task.status ? 'line-through' : ''}`}>
            {task.description}
          </p>
        )}
        <div className="flex flex-wrap gap-2 mt-3">
          {task.tags?.split(',').map((tag) => tag.trim() && (
            <Badge key={tag} variant="outline">{tag.trim()}</Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center text-sm text-muted-foreground">
        <div>
          {task.dueDate && (
            <span>
              Vence em: {format(new Date(task.dueDate), 'dd/MM/yyyy', { locale: ptBR })}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleEdit}>
             <Pencil className="mr-2 h-4 w-4" /> Editar
          </Button>
          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={handleDelete}>Excluir</Button>
        </div>
      </CardFooter>
    </Card>
  );
} 