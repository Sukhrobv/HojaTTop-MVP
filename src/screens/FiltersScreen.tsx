import React, { useState } from 'react'
import { ScrollView, YStack, XStack, Text, Button, Slider, View, Card } from 'tamagui'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '@/navigation'
import { Filters } from '@/types'
import { Accessibility, Baby, Droplets, DollarSign, Check, X } from 'lucide-react-native'
import { useTranslation } from '@/i18n'

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Filters'>

const colors = {
  accessibility: '#2196F3',
  babyChanging: '#FF9800',
  ablution: '#00BCD4',
  free: '#4CAF50',
  primary: '#4ECDC4',
  text: '#2D3436',
  textLight: '#636E72',
  bg: '#F8F9FA',
}

type IconType = React.ComponentType<{ size: number; color: string }>

const FilterCard = ({
  label,
  isActive,
  onPress,
  icon: Icon,
  activeColor,
}: {
  label: string
  isActive: boolean
  onPress: () => void
  icon: IconType
  activeColor: string
}) => {
  return (
    <Card
      width="48%"
      backgroundColor={isActive ? `${activeColor}15` : 'white'}
      borderColor={isActive ? activeColor : 'transparent'}
      borderWidth={2}
      borderRadius="$5"
      padding="$3"
      pressStyle={{ scale: 0.98, opacity: 0.9 }}
      onPress={onPress}
      elevation={isActive ? 0 : 2}
      animation="bouncy"
    >
      <YStack space="$2" alignItems="flex-start">
        <XStack justifyContent="space-between" width="100%">
          <View
            width={40}
            height={40}
            borderRadius={20}
            backgroundColor={isActive ? activeColor : '#F0F2F5'}
            alignItems="center"
            justifyContent="center"
          >
            <Icon size={22} color={isActive ? 'white' : '#B2BEC3'} />
          </View>

          {isActive && (
            <View
              width={24}
              height={24}
              borderRadius={12}
              backgroundColor={activeColor}
              alignItems="center"
              justifyContent="center"
            >
              <Check size={14} color="white" strokeWidth={3} />
            </View>
          )}
        </XStack>

        <Text
          fontSize={15}
          fontWeight={isActive ? '700' : '500'}
          color={isActive ? colors.text : colors.textLight}
          marginTop="$1"
        >
          {label}
        </Text>
      </YStack>
    </Card>
  )
}

const SectionHeader = ({ title }: { title: string }) => (
  <Text fontSize={18} fontWeight="700" color={colors.text} marginBottom="$3" marginLeft="$1">
    {title}
  </Text>
)

export default function FiltersScreen() {
  const navigation = useNavigation<NavigationProp>()
  const route = useRoute<RouteProp<RootStackParamList, 'Filters'>>()
  const { initialFilters, onApply } = route.params || {}
  const { t } = useTranslation()

  const [filters, setFilters] = useState<Filters>(
    initialFilters || {
      isAccessible: false,
      hasBabyChanging: false,
      hasAblution: false,
      isFree: false,
      minRating: 0,
      maxDistance: null,
    },
  )

  const toggleFilter = <K extends keyof Filters>(key: K) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const updateValue = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleApply = () => {
    if (onApply) onApply(filters)
    navigation.goBack()
  }

  const handleReset = () => {
    setFilters({
      isAccessible: false,
      hasBabyChanging: false,
      hasAblution: false,
      isFree: false,
      minRating: 0,
      maxDistance: null,
    })
  }

  const distanceSliderValue = filters.maxDistance === null || filters.maxDistance === undefined ? 10 : filters.maxDistance
  const handleDistanceChange = (value: number) => {
    updateValue('maxDistance', value >= 10 ? null : value)
  }

  const activeCount = [
    filters.isAccessible,
    filters.hasBabyChanging,
    filters.hasAblution,
    filters.isFree,
    (filters.minRating ?? 0) > 0,
    filters.maxDistance !== null && filters.maxDistance !== undefined,
  ].filter(Boolean).length

  return (
    <YStack flex={1} backgroundColor={colors.bg}>
      <ScrollView flex={1} contentContainerStyle={{ paddingBottom: 140 }}>
        <YStack padding="$4" space="$6">
          {/* GRID of feature filters */}
          <YStack>
            <SectionHeader title={t('filters.header.search', 'Что ищем?')} />
            <XStack flexWrap="wrap" justifyContent="space-between" gap="$3">
              <FilterCard
                label={t('filters.card.accessibility', 'Для инвалидов')}
                icon={Accessibility}
                activeColor={colors.accessibility}
                isActive={!!filters.isAccessible}
                onPress={() => toggleFilter('isAccessible')}
              />
              <FilterCard
                label={t('filters.card.baby', 'С детьми')}
                icon={Baby}
                activeColor={colors.babyChanging}
                isActive={!!filters.hasBabyChanging}
                onPress={() => toggleFilter('hasBabyChanging')}
              />
              <FilterCard
                label={t('filters.card.ablution', 'Омовение')}
                icon={Droplets}
                activeColor={colors.ablution}
                isActive={!!filters.hasAblution}
                onPress={() => toggleFilter('hasAblution')}
              />
              <FilterCard
                label={t('filters.card.free', 'Бесплатно')}
                icon={DollarSign}
                activeColor={colors.free}
                isActive={!!filters.isFree}
                onPress={() => toggleFilter('isFree')}
              />
            </XStack>
          </YStack>

          {/* Rating */}
          <YStack backgroundColor="white" padding="$4" borderRadius="$5" elevation={1}>
            <XStack justifyContent="space-between" marginBottom="$4">
              <Text fontWeight="600" fontSize={16}>
                {t('filters.header.rating', 'Минимальный рейтинг')}
              </Text>
              <Text fontWeight="bold" color={colors.primary} fontSize={16}>
                {(filters.minRating ?? 0) > 0 ? `${filters.minRating} ⭐` : t('filters.rating.none', 'Не важно')}
              </Text>
            </XStack>
            <Slider
              defaultValue={[filters.minRating ?? 0]}
              max={5}
              step={1}
              onValueChange={(val) => updateValue('minRating', val[0])}
            >
              <Slider.Track backgroundColor="#F0F2F5" height={6}>
                <Slider.TrackActive backgroundColor="#FFC107" />
              </Slider.Track>
              <Slider.Thumb size="$3" index={0} circular backgroundColor="white" elevation={3} />
            </Slider>
            <XStack justifyContent="space-between" marginTop="$2">
              <Text fontSize={12} color={colors.textLight}>
                {t('filters.rating.left', 'Любой')}
              </Text>
              <Text fontSize={12} color={colors.textLight}>
                {t('filters.rating.right', 'Только 5.0')}
              </Text>
            </XStack>
          </YStack>

          {/* Distance */}
          <YStack backgroundColor="white" padding="$4" borderRadius="$5" elevation={1}>
            <XStack justifyContent="space-between" marginBottom="$4">
              <Text fontWeight="600" fontSize={16}>
                {t('filters.header.distance', 'Расстояние')}
              </Text>
              <Text fontWeight="bold" color={colors.primary} fontSize={16}>
                {filters.maxDistance
                  ? t('filters.distance.value', 'до {km} км').replace('{km}', `${filters.maxDistance}`)
                  : t('filters.distance.all', 'Весь город')}
              </Text>
            </XStack>
            <Slider
              defaultValue={[distanceSliderValue]}
              min={0.5}
              max={10}
              step={0.5}
              onValueChange={(val) => handleDistanceChange(val[0])}
            >
              <Slider.Track backgroundColor="#F0F2F5" height={6}>
                <Slider.TrackActive backgroundColor={colors.primary} />
              </Slider.Track>
              <Slider.Thumb size="$3" index={0} circular backgroundColor="white" elevation={3} />
            </Slider>
            <XStack justifyContent="space-between" marginTop="$2">
              <Text fontSize={12} color={colors.textLight}>
                {t('filters.distance.left', 'Рядом')}
              </Text>
              <Text fontSize={12} color={colors.textLight}>
                {t('filters.distance.right', '∞ Не ограничено')}
              </Text>
            </XStack>
          </YStack>
        </YStack>
      </ScrollView>

      {/* Sticky footer */}
      <YStack
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        backgroundColor="white"
        padding="$4"
        paddingBottom="$6"
        borderTopWidth={1}
        borderTopColor="#F0F2F5"
        shadowColor="#000"
        shadowOpacity={0.05}
        shadowRadius={10}
      >
        <XStack space="$3">
          {activeCount > 0 && (
            <Button
              flex={1}
              variant="outlined"
              borderColor="#FF6B6B"
              color="#FF6B6B"
              onPress={handleReset}
              icon={<X size={18} />}
            >
              {t('filters.buttons.reset', 'Сброс')}
            </Button>
          )}
          <Button
            flex={2}
            backgroundColor={colors.primary}
            onPress={handleApply}
            pressStyle={{ opacity: 0.9 }}
            elevation={2}
          >
            <Text color="white" fontWeight="bold" fontSize={16}>
              {t('filters.buttons.show', 'Показать')} {activeCount > 0 ? `(${activeCount})` : ''}
            </Text>
          </Button>
        </XStack>
      </YStack>
    </YStack>
  )
}
