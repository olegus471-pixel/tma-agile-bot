// src/App.tsx
import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SDKProvider, useLaunchParams, useInitData } from '@telegram-apps/sdk-react';
import { Dashboard } from './components/Dashboard';
import { ClientList } from './components/ClientList';
import { ClientCard } from './components/ClientCard';
import { Analytics } from './components/Analytics';
import { Toaster } from './components/ui/toaster';
import { useWebSocket } from './hooks/useWebSocket';

const queryClient = new QueryClient();

type View = 'dashboard' | 'clients' | 'analytics';

function AppContent() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const initData = useInitData();
  const lp = useLaunchParams();

  // Подключаем WebSocket для real-time обновлений
  useWebSocket();

  useEffect(() => {
    // Инициализация Telegram Web App
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      
      // Разворачиваем приложение на весь экран
      tg.expand();
      
      // Включаем кнопку закрытия
      tg.enableClosingConfirmation();
      
      // Применяем тему Telegram
      document.documentElement.style.setProperty(
        '--tg-theme-bg-color',
        tg.themeParams.bg_color || '#ffffff'
      );
      document.documentElement.style.setProperty(
        '--tg-theme-text-color',
        tg.themeParams.text_color || '#000000'
      );
      
      // Настраиваем главную кнопку
      tg.MainButton.setText('Добавить клиента');
      tg.MainButton.onClick(() => {
        setCurrentView('clients');
      });
      
      // Настраиваем кнопку назад
      tg.BackButton.onClick(() => {
        if (selectedClientId) {
          setSelectedClientId(null);
        } else if (currentView !== 'dashboard') {
          setCurrentView('dashboard');
        }
      });
      
      // Показываем/скрываем кнопку назад
      if (currentView !== 'dashboard' || selectedClientId) {
        tg.BackButton.show();
      } else {
        tg.BackButton.hide();
      }
    }
  }, [currentView, selectedClientId]);

  // Обработка старт параметров (deep linking)
  useEffect(() => {
    if (lp.startParam) {
      // Пример: открыть клиента по ID
      // t.me/bot/app?startapp=client_123
      const match = lp.startParam.match(/^client_(\d+)$/);
      if (match) {
        setSelectedClientId(Number(match[1]));
        setCurrentView('clients');
      }
    }
  }, [lp.startParam]);

  const handleOpenClient = (clientId: number) => {
    setSelectedClientId(clientId);
  };

  const handleCloseClient = () => {
    setSelectedClientId(null);
  };

  // Рендерим выбранную вкладку
  const renderView = () => {
    if (selectedClientId) {
      return (
        <ClientCard 
          clientId={selectedClientId} 
          onClose={handleCloseClient}
        />
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentView} />;
      case 'clients':
        return <ClientList onOpenClient={handleOpenClient} />;
      case 'analytics':
        return <Analytics />;
      default:
        return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Навигация */}
      <nav className="sticky top-0 z-50 bg-background border-b">
        <div className="flex items-center justify-around h-14">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`flex-1 flex flex-col items-center justify-center h-full ${
              currentView === 'dashboard' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs mt-1">Главная</span>
          </button>
          
          <button
            onClick={() => setCurrentView('clients')}
            className={`flex-1 flex flex-col items-center justify-center h-full ${
              currentView === 'clients' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-xs mt-1">Клиенты</span>
          </button>
          
          <button
            onClick={() => setCurrentView('analytics')}
            className={`flex-1 flex flex-col items-center justify-center h-full ${
              currentView === 'analytics' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs mt-1">Аналитика</span>
          </button>
        </div>
      </nav>

      {/* Основной контент */}
      <main className="pb-safe">
        {renderView()}
      </main>

      {/* Уведомления */}
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SDKProvider acceptCustomStyles>
        <AppContent />
      </SDKProvider>
    </QueryClientProvider>
  );
}

export default App;
