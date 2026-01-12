import React, { useState } from 'react'
import { ScrollView, YStack, XStack, Text, Button, Separator, Switch, Label, Slider, View } from 'tamagui'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '@/navigation'
import { Filters } from '@/types'
import { Accessibility, Baby, Droplets, DollarSign, SlidersHorizontal } from 'lucide-react-native'

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Filters'>

// Unified colors (same as ToiletDetailScreen)
const colors = {
  accessibility: '#2196F3', // Blue
  babyChanging: '#FF9800',  // Orange
  ablution: '#00BCD4',      // Light blue
  free: '#4CAF50',          // Green
  primary: '#4ECDC4',
}

const FilterSwitch = ({ 
  label, 
  value, 
  onChange,
  icon: Icon,
  iconColor
}: { 
  label: string
  value: boolean
  onChange: (value: boolean) => void
  icon?: React.ComponentType<{ size: number; color: string }>
  iconColor?: string
}) => {
  return (
    <XStack alignItems="center" justifyContent="space-between" paddingVertical="$3">
      <XStack alignItems="center" space="$3" flex={1}>
        {Icon && (
          <View 
            width={36} 
            height={36} 
            borderRadius={18}
            backgroundColor={value ? iconColor || colors.primary : '#E0E0E0'}
            alignItems="center"
            justifyContent="center"
          >
            <Icon size={20} color="white" />
          </View>
        )}
        <Label flex={1} fontSize={16}>{label}</Label>
      </XStack>
      <Switch
        size="$4"
        checked={value}
        onCheckedChange={onChange}
        backgroundColor={value ? colors.primary : '#E0E0E0'}
      >
        <Switch.Thumb animation="bouncy" backgroundColor="white" />
      </Switch>
    </XStack>
  )
}

const FilterSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <YStack 
    backgroundColor="white" 
    borderRadius="$4" 
    padding="$4" 
    space="$3"
    shadowColor="#000"
    shadowOffset={{ width: 0, height: 2 }}
    shadowOpacity={0.1}
    shadowRadius={4}
    elevation={2}
  >
    <Text fontSize={18} fontWeight="bold" color="#1A1A1A">
      {title}
    </Text>
    <Separator borderColor="#F0F0F0" />
    <YStack>
      {children}
    </YStack>
  </YStack>
)

export default function FiltersScreen() {
  const navigation = useNavigation<NavigationProp>()
  const route = useRoute<RouteProp<RootStackParamList, 'Filters'>>()
  const { initialFilters, onApply } = route.params || {}

  // Filter state - maxDistance null means "infinite"
  const [filters, setFilters] = useState<Filters>(initialFilters || {
    isAccessible: false,
    hasBabyChanging: false,
    hasAblution: false,
    isFree: false,
    minRating: 0,
    maxDistance: null, // null = infinite
  })

  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleApply = () => {
    if (onApply) {
      onApply(filters)
    }
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

  // Count active filters
  const activeFiltersCount = [
    filters.isAccessible,
    filters.hasBabyChanging,
    filters.hasAblution,
    filters.isFree,
    (filters.minRating ?? 0) > 0,
    filters.maxDistance !== null && filters.maxDistance !== undefined
  ].filter(Boolean).length

  const hasActiveFilters = activeFiltersCount > 0

  // Distance slider value: use 10 for "infinite", otherwise actual value
  const distanceSliderValue = (filters.maxDistance === null || filters.maxDistance === undefined) ? 10 : filters.maxDistance

  const handleDistanceChange = (value: number) => {
    if (value >= 10) {
      updateFilter('maxDistance', null) // infinite
    } else {
      updateFilter('maxDistance', value)
    }
  }

  const getDistanceLabel = () => {
    if (filters.maxDistance === null || filters.maxDistance === undefined) {
      return 'Без ограничений'
    }
    if (filters.maxDistance < 1) {
      return `До ${Math.round(filters.maxDistance * 1000)} м`
    }
    return `До ${filters.maxDistance} км`
  }

  return (
    <ScrollView flex={1} backgroundColor="#F5F5F5">
      <YStack padding="$4" space="$4" paddingBottom="$8">
        
        {/* Active Filters Indicator */}
        {hasActiveFilters && (
          <XStack 
            backgroundColor={colors.primary}
            borderRadius="$4"
            padding="$3"
            alignItems="center"
            justifyContent="center"
            space="$2"
          >
            <SlidersHorizontal size={20} color="white" />
            <Text color="white" fontWeight="600" fontSize={14}>
              Активных фильтров: {activeFiltersCount}
            </Text>
          </XStack>
        )}

        {/* Features Filters */}
        <FilterSection title="Особенности">
          <FilterSwitch
            label="Доступно для инвалидов"
            icon={Accessibility}
            iconColor={colors.accessibility}
            value={!!filters.isAccessible}
            onChange={(value) => updateFilter('isAccessible', value)}
          />
          <FilterSwitch
            label="Пеленальный столик"
            icon={Baby}
            iconColor={colors.babyChanging}
            value={!!filters.hasBabyChanging}
            onChange={(value) => updateFilter('hasBabyChanging', value)}
          />
          <FilterSwitch
            label="Место для омовения"
            icon={Droplets}
            iconColor={colors.ablution}
            value={!!filters.hasAblution}
            onChange={(value) => updateFilter('hasAblution', value)}
          />
          <FilterSwitch
            label="Только бесплатные"
            icon={DollarSign}
            iconColor={colors.free}
            value={!!filters.isFree}
            onChange={(value) => updateFilter('isFree', value)}
          />
        </FilterSection>

        {/* Rating Filter */}
        <FilterSection title="Минимальный рейтинг">
          <YStack space="$4" paddingTop="$2">
            <XStack alignItems="center" justifyContent="space-between">
              <Text color="#666">Любой</Text>
              <Text color="#666">5 ⭐</Text>
            </XStack>
            <Slider
              defaultValue={[filters.minRating ?? 0]}
              max={5}
              step={0.5}
              onValueChange={(value) => updateFilter('minRating', value[0])}
            >
              <Slider.Track backgroundColor="#E0E0E0" height={4}>
                <Slider.TrackActive backgroundColor="#4ECDC4" />
              </Slider.Track>
              <Slider.Thumb
                circular
                size="$2"
                index={0}
                backgroundColor="#4ECDC4"
                elevation={2}
              />
            </Slider>
            <Text textAlign="center" color="#4ECDC4" fontWeight="600">
              {(filters.minRating ?? 0) > 0 ? `От ${filters.minRating} ⭐ и выше` : 'Любой рейтинг'}
            </Text>
          </YStack>
        </FilterSection>

        {/* Distance Filter */}
        <FilterSection title="Максимальное расстояние">
          <YStack space="$4" paddingTop="$2">
            <XStack alignItems="center" justifyContent="space-between">
              <Text color="#666">500м</Text>
              <Text color="#666">∞</Text>
            </XStack>
            <Slider
              defaultValue={[distanceSliderValue]}
              min={0.5}
              max={10}
              step={0.5}
              onValueChange={(value) => handleDistanceChange(value[0])}
            >
              <Slider.Track backgroundColor="#E0E0E0" height={4}>
                <Slider.TrackActive backgroundColor="#4ECDC4" />
              </Slider.Track>
              <Slider.Thumb
                circular
                size="$2"
                index={0}
                backgroundColor="#4ECDC4"
                elevation={2}
              />
            </Slider>
            <Text textAlign="center" color="#4ECDC4" fontWeight="600">
              {getDistanceLabel()}
            </Text>
          </YStack>
        </FilterSection>

        {/* Action Buttons */}
        <YStack space="$3" marginTop="$2">
          <Button 
            size="$5" 
            backgroundColor="#4ECDC4"
            pressStyle={{ backgroundColor: '#3BA99C' }}
            onPress={handleApply}
            borderRadius="$4"
          >
            <Text color="white" fontWeight="bold" fontSize={16}>
              Применить фильтры {hasActiveFilters ? `(${activeFiltersCount})` : ''}
            </Text>
          </Button>
          
          {hasActiveFilters && (
            <Button 
              size="$5" 
              variant="outlined"
              borderColor="#FF6B6B"
              onPress={handleReset}
              borderRadius="$4"
              backgroundColor="transparent"
            >
              <Text color="#FF6B6B" fontWeight="bold" fontSize={16}>
                Сбросить фильтры
              </Text>
            </Button>
          )}
        </YStack>
      </YStack>
    </ScrollView>
  )
}