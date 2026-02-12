import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/badge';
import { Edit2 } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  deadline: string;
  responsible: string;
  subtasks: string[];
  description: string;
}

interface Props {
  task: Task;
  onEdit: () => void;
}

export default function SortableTask({ task, onEdit }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColor = {
    high: 'bg-red-100 border-red-500 text-red-800',
    medium: 'bg-yellow-100 border-yellow-500 text-yellow-800',
    low: 'bg-green-100 border-green-500 text-green-800',
  }[task.priority];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-4 rounded-lg border shadow-sm cursor-grab active:cursor-grabbing ${priorityColor}`}
    >
      <div className="flex items-center justify-between">
        <p className="font-medium">{task.title}</p>
        <Button variant="ghost" size="icon" onClick={onEdit}>
          <Edit2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-2 space-y-1 text-xs text-gray-600">
        <p>Приоритет: <Badge variant="outline">{task.priority.toUpperCase()}</Badge></p>
        <p>Дедлайн: {task.deadline || 'Нет'}</p>
        <p>Ответственный: {task.responsible || 'Нет'}</p>
        <p>Описание: {task.description || 'Нет'}</p>
        <p>Подзадачи:</p>
        <ul className="list-disc pl-4">
          {task.subtasks.map((subtask, index) => (
            <li key={index}>{subtask}</li>
          ))}
          {task.subtasks.length === 0 && <li>Нет подзадач</li>}
        </ul>
      </div>
    </div>
  );
}