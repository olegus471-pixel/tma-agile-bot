// src/hooks/useWebSocket.ts
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';

export function useWebSocket() {
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    // Подключаемся к WebSocket
    const socket = io(WS_URL, {
      auth: {
        token: window.Telegram?.WebApp?.initData || '',
      },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    // События подключения
    socket.on('connect', () => {
      console.log('✅ WebSocket connected');
    });

    socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
    });

    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Новый клиент добавлен
    socket.on('client:created', (data) => {
      console.log('New client created:', data);
      
      // Обновляем кэш клиентов
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      // Показываем уведомление
      toast({
        title: 'Новый клиент!',
        description: `${data.client.name} был добавлен`,
      });

      // Вибрация
      window.Telegram?.WebApp?.HapticFeedback.notificationOccurred('success');
    });

    // Клиент обновлен
    socket.on('client:updated', (data) => {
      console.log('Client updated:', data);
      
      // Обновляем кэш
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', data.client.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      // Показываем уведомление
      toast({
        title: 'Клиент обновлен',
        description: `${data.client.name}`,
      });
    });

    // Клиент удален
    socket.on('client:deleted', (data) => {
      console.log('Client deleted:', data);
      
      // Обновляем кэш
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      // Показываем уведомление
      toast({
        title: 'Клиент удален',
        description: `ID: ${data.clientId}`,
        variant: 'destructive',
      });
    });

    // Новое взаимодействие
    socket.on('interaction:created', (data) => {
      console.log('New interaction:', data);
      
      // Обновляем кэш взаимодействий
      queryClient.invalidateQueries({ queryKey: ['interactions', data.interaction.clientId] });
      
      // Показываем уведомление
      toast({
        title: 'Новое взаимодействие',
        description: data.interaction.content.substring(0, 50) + '...',
      });

      // Вибрация
      window.Telegram?.WebApp?.HapticFeedback.notificationOccurred('success');
    });

    // Синхронизация с Google Sheets завершена
    socket.on('sync:completed', (data) => {
      console.log('Sync completed:', data);
      
      // Обновляем все данные
      queryClient.invalidateQueries();
      
      // Показываем уведомление
      toast({
        title: 'Синхронизация завершена',
        description: `Обновлено клиентов: ${data.updated}`,
      });
    });

    // Ошибка синхронизации
    socket.on('sync:error', (data) => {
      console.error('Sync error:', data);
      
      toast({
        title: 'Ошибка синхронизации',
        description: data.error,
        variant: 'destructive',
      });
    });

    // Отключаемся при размонтировании
    return () => {
      socket.disconnect();
    };
  }, [queryClient, toast]);

  return socketRef.current;
}
