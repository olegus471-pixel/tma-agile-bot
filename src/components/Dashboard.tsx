// src/components/Dashboard.tsx
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { apiClient } from '../lib/api-client';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, UserPlus, TrendingUp, Clock } from 'lucide-react';

interface DashboardData {
  totalClients: number;
  newClientsToday: number;
  newClientsWeek: number;
  conversionRate: number;
  clientsByStatus: { status: string; count: number; color: string }[];
  clientsBySource: { source: string; count: number }[];
  timeline: { date: string; clients: number }[];
}

interface DashboardProps {
  onNavigate: (view: 'dashboard' | 'clients' | 'analytics') => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () => apiClient.get('/analytics/dashboard').then(res => res.data),
    refetchInterval: 30000, // Обновляем каждые 30 секунд
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Ошибка загрузки данных. Попробуйте обновить страницу.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="p-4 space-y-4">
      {/* Приветствие */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Привет! 👋</h1>
        <p className="text-muted-foreground">Вот что происходит с вашими клиентами</p>
      </div>

      {/* Ключевые метрики */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего клиентов</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              +{data.newClientsWeek} за неделю
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Новые сегодня</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.newClientsToday}</div>
            <p className="text-xs text-muted-foreground">
              За последние 24 часа
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Конверсия</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Новый → Завершен
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:bg-accent transition-colors"
          onClick={() => onNavigate('clients')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Требуют внимания</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.clientsByStatus.find(s => s.status === 'in_progress')?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Нажмите для просмотра
            </p>
          </CardContent>
        </Card>
      </div>

      {/* График динамики */}
      <Card>
        <CardHeader>
          <CardTitle>Динамика клиентов</CardTitle>
          <CardDescription>Последние 7 дней</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                labelFormatter={(value) => new Date(value).toLocaleDateString('ru-RU')}
              />
              <Line 
                type="monotone" 
                dataKey="clients" 
                stroke="#0088FE" 
                strokeWidth={2}
                dot={{ fill: '#0088FE', r: 4 }}
                name="Клиенты"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Статусы клиентов */}
      <Card>
        <CardHeader>
          <CardTitle>Статусы клиентов</CardTitle>
          <CardDescription>Распределение по статусам</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie
                  data={data.clientsByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="count"
                  label={(entry) => entry.count}
                >
                  {data.clientsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            
            <div className="flex-1 space-y-2">
              {data.clientsByStatus.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">
                      {item.status === 'new' && 'Новый'}
                      {item.status === 'in_progress' && 'В работе'}
                      {item.status === 'completed' && 'Завершен'}
                      {item.status === 'lost' && 'Потерян'}
                    </span>
                  </div>
                  <span className="text-sm font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Источники клиентов */}
      <Card>
        <CardHeader>
          <CardTitle>Источники клиентов</CardTitle>
          <CardDescription>Откуда приходят клиенты</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.clientsBySource}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="source" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const labels: Record<string, string> = {
                    bot: 'Бот',
                    manual: 'Вручную',
                    import: 'Импорт',
                    api: 'API'
                  };
                  return labels[value] || value;
                }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                labelFormatter={(value) => {
                  const labels: Record<string, string> = {
                    bot: 'Telegram Бот',
                    manual: 'Добавлено вручную',
                    import: 'Импортировано',
                    api: 'Через API'
                  };
                  return labels[value] || value;
                }}
              />
              <Bar dataKey="count" fill="#0088FE" radius={[8, 8, 0, 0]} name="Клиенты" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Быстрые действия */}
      <div className="grid grid-cols-2 gap-4">
        <Card 
          className="cursor-pointer hover:bg-accent transition-colors"
          onClick={() => onNavigate('clients')}
        >
          <CardContent className="flex flex-col items-center justify-center p-6">
            <UserPlus className="h-8 w-8 mb-2 text-primary" />
            <p className="text-sm font-medium">Добавить клиента</p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:bg-accent transition-colors"
          onClick={() => onNavigate('analytics')}
        >
          <CardContent className="flex flex-col items-center justify-center p-6">
            <TrendingUp className="h-8 w-8 mb-2 text-primary" />
            <p className="text-sm font-medium">Подробная аналитика</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
