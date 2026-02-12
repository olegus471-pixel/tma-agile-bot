import { useEffect, useState } from 'react';
import { useLaunchParams } from '@telegram-apps/sdk-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
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

// Список разрешённых Telegram ID — твой ID уже добавлен
const allowedIds: number[] = [
  5652671788, // ← ТВОЙ ID
  // добавь другие ID админов сюда, например: 987654321,
];

// Пример данных для Kanban (потом подключим Google Sheets)
const initialColumns = {
  new: [
    { id: 'task-1', title: 'Подготовить документы для AIMA', priority: 'high' },
    { id: 'task-2', title: 'Позвонить клиенту Иванову', priority: 'medium' },
    { id: 'task-6', title: 'Проверить статус визы', priority: 'low' },
  ],
  inProgress: [
    { id: 'task-3', title: 'Согласовать встречу с клиентом', priority: 'high' },
    { id: 'task-4', title: 'Отправить договор на подпись', priority: 'medium' },
  ],
  done: [
    { id: 'task-5', title: 'Получить подтверждение от банка', priority: 'low' },
  ],
};

function App() {
  const [user, setUser] = useState<any>(null);
  const [isTelegram, setIsTelegram] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
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

  const lp = useLaunchParams();

  useEffect(() => {
    let isMounted = true;

    const checkTelegram = () => {
      if (!isMounted) return;

      if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
        const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
        setUser(tgUser);
        setIsTelegram(true);
        setIsAuthorized(allowedIds.includes(tgUser.id));
        return;
      }

      try {
        if (lp?.initData?.user) {
          const sdkUser = lp.initData.user;
          setUser(sdkUser);
          setIsTelegram(true);
          setIsAuthorized(allowedIds.includes(sdkUser.id));
          return;
        }
      } catch (err) {
        console.log('SDK check failed (normal in browser):', err);
      }

      setIsTelegram(false);
      setIsAuthorized(false);
    };

    checkTelegram();

    const interval = setInterval(checkTelegram, 300);

    const timeout = setTimeout(() => {
      if (isMounted && !isTelegram) {
        setIsTelegram(false);
        setIsAuthorized(false);
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [lp]);

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

  const findContainer = (id: string) => {
    if (id in columns) {
      return id;
    }
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
      priority: newTask.priority as 'high' | 'medium' | 'low',
    };

    setColumns((prev) => ({
      ...prev,
      new: [...prev.new, newTaskObj],
    }));

    setNewTask({ title: '', priority: 'high' | 'medium' | 'low', description: '' });
    setNewTaskOpen(false);
  };

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-600 animate-pulse">Проверка доступа...</p>
      </div>
    );
  }

  if (!isTelegram) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Откройте в Telegram
          </h2>
          <p className="text-gray-600 mb-6">
            Это приложение работает только внутри Telegram Mini App
          </p>
          <p className="text-sm text-gray-500">
            Запустите через вашего бота и нажмите кнопку Web App
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-6">
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md border border-red-200">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Доступ запрещён
          </h2>
          <p className="text-gray-700 mb-6">
            Это приложение доступно только для авторизованных пользователей.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Ваш Telegram ID: <strong>{user?.id || 'не определён'}</strong>
          </p>
          <p className="text-sm text-gray-500">
            Свяжитесь с администратором для добавления доступа.
          </p>
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
            {user.first_name} {user.last_name || ''} (@{user.username || 'нет'})
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
              <Dialog open={newTaskOpen} onOpenChange={(open) => {
  setNewTaskOpen(open);
  if (!open) {
    // Сброс формы при закрытии
    setNewTask({ title: '', priority: 'medium', description: '' });
  }
}}>
  <DialogTrigger asChild>
    <Button>+ Новая задача</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 z-[1000]">
    <DialogHeader>
      <DialogTitle className="text-lg font-semibold">Создать новую задачу</DialogTitle>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="title" className="text-right">
          Заголовок
        </Label>
        <Input
          id="title"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          placeholder="Введите заголовок"
          className="col-span-3 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="priority" className="text-right">
          Приоритет
        </Label>
        <Select
          value={newTask.priority}
          onValueChange={(value) => {
            setNewTask({ ...newTask, priority: value as 'high' | 'medium' | 'low' });
          }}
          defaultValue="medium"
        >
          <SelectTrigger className="col-span-3 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
            <SelectValue placeholder="Выберите приоритет" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 z-[1001]">
            <SelectItem value="high" className="text-red-600 dark:text-red-400">Высокий</SelectItem>
            <SelectItem value="medium" className="text-yellow-600 dark:text-yellow-400">Средний</SelectItem>
            <SelectItem value="low" className="text-green-600 dark:text-green-400">Низкий</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="description" className="text-right">
          Описание
        </Label>
        <Textarea
          id="description"
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          placeholder="Подробное описание задачи"
          className="col-span-3 min-h-[80px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400"
        />
      </div>
    </div>
    <div className="flex justify-end gap-3">
      <Button variant="outline" onClick={() => setNewTaskOpen(false)}>
        Отмена
      </Button>
      <Button onClick={addNewTask} disabled={!newTask.title.trim()}>
        Создать задачу
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

          <TabsContent value="submissions">
            <Card>
              <CardHeader>
                <CardTitle>Мои подачи</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Список подач в Консульство, AIMA, Банк, IMT</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courts">
            <Card>
              <CardHeader>
                <CardTitle>Суды</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Статус судебных дел</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Календарь встреч</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Записи и слоты</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="bg-white border-t p-4 text-center text-sm text-gray-500">
        Migrall Mini App • Доступ только для авторизованных
      </footer>
    </div>
  );
}

export default App;