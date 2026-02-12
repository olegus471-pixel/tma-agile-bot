import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'  // ← Вот этот импорт был пропущен!

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in App:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Ошибка загрузки
            </h2>
            <p className="text-gray-600 mb-6">
              Приложение работает только внутри Telegram. Откройте через бота.
            </p>
            <Button onClick={() => window.location.reload()}>
              Перезагрузить
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary