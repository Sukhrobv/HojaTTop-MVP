import React from 'react'
import { XStack, Text, Button } from 'tamagui'
import { DataSource } from '@/types'

interface DataStatusBannerProps {
  dataSource: DataSource
  isStale: boolean
  lastUpdated: number | null
  toiletsCount: number
  onRefresh?: () => void
  loading?: boolean
}

export default function DataStatusBanner({
  dataSource,
  isStale,
  lastUpdated,
  toiletsCount,
  onRefresh,
  loading = false
}: DataStatusBannerProps) {
  
  // Don't show banner if data is fresh from network
  if (dataSource === 'network' && !isStale) {
    return null
  }

  // Format last updated time
  const formatLastUpdated = (timestamp: number | null) => {
    if (!timestamp) return ''
    
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    
    if (minutes < 1) return 'только что'
    if (minutes < 60) return `${minutes} мин назад`
    if (hours < 24) return `${hours} ч назад`
    
    const days = Math.floor(hours / 24)
    return `${days} дн назад`
  }

  const getStatusColor = () => {
    switch (dataSource) {
      case 'cache':
        return isStale ? '#FF9800' : '#4CAF50'
      case 'none':
        return '#F44336'
      default:
        return '#4CAF50'
    }
  }

  const getStatusText = () => {
    switch (dataSource) {
      case 'cache':
        return isStale ? 'Офлайн данные' : 'Кэшированные данные'
      case 'none':
        return 'Нет данных'
      default:
        return 'Онлайн'
    }
  }

  const getStatusIcon = () => {
    switch (dataSource) {
      case 'cache':
        return isStale ? '📱' : '💾'
      case 'none':
        return '❌'
      default:
        return '🌐'
    }
  }

  return (
    <XStack
      backgroundColor={getStatusColor()}
      paddingHorizontal="$3"
      paddingVertical="$2"
      alignItems="center"
      justifyContent="space-between"
      opacity={0.9}
    >
      <XStack alignItems="center" space="$2" flex={1}>
        <Text fontSize={14}>{getStatusIcon()}</Text>
        <Text color="white" fontSize={14} fontWeight="500">
          {getStatusText()}
        </Text>
        <Text color="white" fontSize={12} opacity={0.8}>
          • {toiletsCount} туалетов
        </Text>
        {lastUpdated && (
          <Text color="white" fontSize={12} opacity={0.8}>
            • {formatLastUpdated(lastUpdated)}
          </Text>
        )}
      </XStack>

      {onRefresh && dataSource === 'cache' && (
        <Button
          size="$2"
          backgroundColor="rgba(255,255,255,0.2)"
          pressStyle={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
          onPress={onRefresh}
          disabled={loading}
        >
          <Text color="white" fontSize={12} fontWeight="600">
            {loading ? 'Обновление...' : 'Обновить'}
          </Text>
        </Button>
      )}
    </XStack>
  )
}