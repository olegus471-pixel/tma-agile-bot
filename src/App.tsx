import { useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import SortableTask from './SortableTask';

// Разрешённые ID (только эти пользователи увидят дашборд)
const allowedIds: number[] = [
  5652671788, // ← ТВОЙ ID
  // добавь других админов сюда
];

// Начальные колонки задач
const initialColumns = {
  new: [
    { id: 'task-1', title: 'Подготовить документы для AIMA', priority: 'high' },
    { id: 'task-2', title: 'Позвонить клиенту Иванову', priority: 'medium' },
  ],
  inProgress: [
    { id: 'task-3', title: 'Проверить статус подачи в Консульство', priority: 'high' },
    { id: 'task-4', title: 'Согласовать встречу', priority: 'low' },
  ],
  done: [
    { id: 'task-5', title: 'Отправить договор', priority: 'medium' },
  ],
};

function App() {
  const [user, setUser] = useState<any>(null);
  const [isTelegram, setIsTelegram] = useState<boolean | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [columns, setColumns] = useState(initialColumns);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    priority: 'medium',
    description: '',
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;

    if (tg?.initDataUnsafe?.user) {
      tg.ready();
      tg.expand();
      const tgUser = tg.initDataUnsafe.user;
      setUser(tgUser);
      setIsTelegram(true);
      setIsAuthorized(allowedIds.includes(tgUser.id));
      return;
    }

    // Если Telegram.WebApp не найден — это не Telegram (или кэш/ошибка)
    setIsTelegram(false);
    setIsAuthorized(false);
  }, []);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);

    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    setColumns((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];

      const activeIndex = activeItems.findIndex((item) => item.id === active.id);
      const overIndex = overItems.findIndex((item) => item.id === over.id);

      const newActiveItems = activeItems.filter((item) => item.id !== active.id);
      const newOverItems = [...overItems];

      newOverItems.splice(overIndex, 0, activeItems[activeIndex]);

      return {
        ...prev,
        [activeContainer]: newActiveItems,
        [overContainer]: newOverItems,
      };
    });
  };

  const findContainer = (id) => {
    if (id in columns) return id;
    return Object.keys(columns).find((key) =>
      columns[key].some((item) => item.id === id)
    );
  };

  const addNewTask = () => {
    if (!newTask.title.trim()) return;

    const newId = `task-${Date.now()}`;
    const newTaskObj = {
      id: newId,
      title: newTask.title,
      priority: newTask.priority,
      description: newTask.description,
    };

    setColumns((prev) => ({
      ...prev,
      new: [...prev.new, newTaskObj],
    }));

    setNewTask({ title: '', priority: 'medium', description: '' });
    setNewTaskOpen(false);
  };

  // Экраны загрузки и ошибок
  if (isTelegram === null) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-400">Загрузка...</div>;
  }

  if (!isTelegram) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 text-center">
        <div>
          <h2 className="text-xl font-bold mb-2">Откройте в Telegram</h2>
          <p className="text-gray-500">Приложение доступно только через официального бота.</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-6 text-center">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-red-100">
          <h2 className="text-red-600 font-bold text-xl mb-4">Доступ запрещён</h2>
          <p className="text-sm text-gray-500">Ваш ID: {user?.id || 'не определён'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      <header className="bg-white shadow-sm p-4 border-b">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-700">Migrall Agile</h1>
          <div className="text-sm text-gray-600">
            {user?.first_name || 'Пользователь'} (@{user?.username || 'нет'})
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <Tabs defaultValue="kanban" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="submissions">Подачи</TabsTrigger>
            <TabsTrigger value="courts">Суды</TabsTrigger>
            <TabsTrigger value="calendar">Календарь</TabsTrigger>
          </TabsList>

          <TabsContent value="kanban">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Kanban доска</h2>
              <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
                <DialogTrigger asChild>
                  <Button>+ Новая задача</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Создать новую задачу</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Заголовок</Label>
                      <Input
                        id="title"
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        placeholder="Что нужно сделать?"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Приоритет</Label>
                      <Select
                        value={newTask.priority}
                        onValueChange={(v) => setNewTask({ ...newTask, priority: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">Высокий 🔥</SelectItem>
                          <SelectItem value="medium">Средний ⚡</SelectItem>
                          <SelectItem value="low">Низкий 🟢</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Описание</Label>
                      <Textarea
                        id="description"
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                        placeholder="Детали задачи..."
                      />
                    </div>
                    <Button className="w-full" onClick={addNewTask} disabled={!newTask.title.trim()}>
                      Добавить на доску
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleDragEnd}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(columns).map(([columnId, columnTasks]) => (
                  <Card key={columnId} className="bg-white">
                    <CardHeader>
                      <CardTitle className="capitalize flex items-center justify-between">
                        {columnId === 'new' ? 'Новые' :
                         columnId === 'inProgress' ? 'В работе' : 'Готово'}
                        <Badge variant="secondary">{columnTasks.length}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SortableContext
                        items={columnTasks.map(t => t.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-3 min-h-[200px]">
                          {columnTasks.map(task => (
                            <SortableTask key={task.id} task={task} />
                          ))}
                        </div>
                      </SortableContext>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DndContext>
          </TabsContent>

          {/* Остальные вкладки — заглушки */}
          <TabsContent value="submissions"><Card className="p-8 text-center text-gray-400 text-sm">Здесь будут ваши подачи...</Card></TabsContent>
          <TabsContent value="courts"><Card className="p-8 text-center text-gray-400 text-sm">Статус судебных дел...</Card></TabsContent>
          <TabsContent value="calendar"><Card className="p-8 text-center text-gray-400 text-sm">Календарь встреч...</Card></TabsContent>
        </Tabs>
      </main>

      <footer className="bg-white border-t p-4 text-center text-sm text-gray-500">
        Migrall Mini App • Доступ только для авторизованных
      </footer>
    </div>
  );
}

export default App;