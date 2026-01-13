import React from 'react'
import { XStack, Text, Button } from 'tamagui'
import { DataSource } from '@/types'
import { useTranslation } from '@/i18n'

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
  const { t } = useTranslation()
  
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
    
    if (minutes < 1) return t('banner.time.justNow')
    if (minutes < 60) return t('banner.time.minAgo').replace('{min}', minutes.toString())
    if (hours < 24) return t('banner.time.hourAgo').replace('{hour}', hours.toString())
    
    const days = Math.floor(hours / 24)
    return t('banner.time.dayAgo').replace('{day}', days.toString())
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
        return isStale ? t('banner.status.offline') : t('banner.status.cached')
      case 'none':
        return t('banner.status.noData')
      default:
        return t('banner.status.online')
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
          • {t('banner.count').replace('{count}', toiletsCount.toString())}
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
            {loading ? t('banner.btn.updating') : t('banner.btn.update')}
          </Text>
        </Button>
      )}
    </XStack>
  )
}