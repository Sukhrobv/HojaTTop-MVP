import React, { useState } from 'react'
import { ScrollView, YStack, XStack, Text, Button, Card, Separator, Switch, Label, Slider } from 'tamagui'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '@/navigation'

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Filters'>

interface Filters {
  isAccessible: boolean
  hasBabyChanging: boolean
  hasAblution: boolean
  isFree: boolean
  minRating: number
  maxDistance: number
}

const FilterSwitch = ({ 
  label, 
  value, 
  onChange 
}: { 
  label: string
  value: boolean
  onChange: (value: boolean) => void 
}) => {
  return (
    <XStack alignItems="center" justifyContent="space-between" paddingVertical="$2">
      <Label flex={1}>{label}</Label>
      <Switch
        size="$4"
        checked={value}
        onCheckedChange={onChange}
        backgroundColor={value ? '#4ECDC4' : '$backgroundPress'}
      >
        <Switch.Thumb animation="bouncy" />
      </Switch>
    </XStack>
  )
}

export default function FiltersScreen() {
  const navigation = useNavigation<NavigationProp>()

  // Filter state
  const [filters, setFilters] = useState<Filters>({
    isAccessible: false,
    hasBabyChanging: false,
    hasAblution: false,
    isFree: false,
    minRating: 0,
    maxDistance: 5,
  })

  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleApply = () => {
    // TODO: Apply filters to the map
    console.log('Applied filters:', filters)
    navigation.goBack()
  }

  const handleReset = () => {
    setFilters({
      isAccessible: false,
      hasBabyChanging: false,
      hasAblution: false,
      isFree: false,
      minRating: 0,
      maxDistance: 5,
    })
  }

  const hasActiveFilters = Object.values(filters).some(value => 
    typeof value === 'boolean' ? value : value > 0
  )

  return (
    <ScrollView flex={1} backgroundColor="$background">
      <YStack padding="$4" space="$4">
        {/* Features Filters */}
        <Card elevate bordered>
          <Card.Header>
            <Text fontSize={18} fontWeight="bold">
              Особенности
            </Text>
          </Card.Header>
          
          <Separator />
          
          <Card.Footer padded>
            <YStack>
              <FilterSwitch
                label="Доступно для инвалидов"
                value={filters.isAccessible}
                onChange={(value) => updateFilter('isAccessible', value)}
              />
              <FilterSwitch
                label="Пеленальный столик"
                value={filters.hasBabyChanging}
                onChange={(value) => updateFilter('hasBabyChanging', value)}
              />
              <FilterSwitch
                label="Место для омовения"
                value={filters.hasAblution}
                onChange={(value) => updateFilter('hasAblution', value)}
              />
              <FilterSwitch
                label="Только бесплатные"
                value={filters.isFree}
                onChange={(value) => updateFilter('isFree', value)}
              />
            </YStack>
          </Card.Footer>
        </Card>

        {/* Rating Filter */}
        <Card elevate bordered>
          <Card.Header>
            <Text fontSize={18} fontWeight="bold">
              Минимальный рейтинг
            </Text>
          </Card.Header>
          
          <Separator />
          
          <Card.Footer padded>
            <YStack space="$3">
              <XStack alignItems="center" justifyContent="space-between">
                <Text>Любой</Text>
                <Text>5 ⭐</Text>
              </XStack>
              <Slider
                defaultValue={[filters.minRating]}
                max={5}
                step={0.5}
                onValueChange={(value) => updateFilter('minRating', value[0])}
              >
                <Slider.Track backgroundColor="$backgroundPress">
                  <Slider.TrackActive backgroundColor="#4ECDC4" />
                </Slider.Track>
                <Slider.Thumb
                  circular
                  size="$2"
                  index={0}
                  backgroundColor="#4ECDC4"
                />
              </Slider>
              <Text textAlign="center" color="$colorSubtle">
                {filters.minRating > 0 ? `От ${filters.minRating} ⭐ и выше` : 'Любой рейтинг'}
              </Text>
            </YStack>
          </Card.Footer>
        </Card>

        {/* Distance Filter */}
        <Card elevate bordered>
          <Card.Header>
            <Text fontSize={18} fontWeight="bold">
              Максимальное расстояние
            </Text>
          </Card.Header>
          
          <Separator />
          
          <Card.Footer padded>
            <YStack space="$3">
              <XStack alignItems="center" justifyContent="space-between">
                <Text>500м</Text>
                <Text>5км</Text>
              </XStack>
              <Slider
                defaultValue={[filters.maxDistance]}
                min={0.5}
                max={5}
                step={0.5}
                onValueChange={(value) => updateFilter('maxDistance', value[0])}
              >
                <Slider.Track backgroundColor="$backgroundPress">
                  <Slider.TrackActive backgroundColor="#4ECDC4" />
                </Slider.Track>
                <Slider.Thumb
                  circular
                  size="$2"
                  index={0}
                  backgroundColor="#4ECDC4"
                />
              </Slider>
              <Text textAlign="center" color="$colorSubtle">
                До {filters.maxDistance} км
              </Text>
            </YStack>
          </Card.Footer>
        </Card>

        {/* Action Buttons */}
        <YStack space="$3">
          <Button 
            size="$5" 
            backgroundColor="#4ECDC4"
            pressStyle={{ backgroundColor: '#3BA99C' }}
            onPress={handleApply}
          >
            <Text color="white" fontWeight="bold">
              Применить фильтры
            </Text>
          </Button>
          
          {hasActiveFilters && (
            <Button 
              size="$5" 
              variant="outlined"
              borderColor="#FF6B6B"
              onPress={handleReset}
            >
              <Text color="#FF6B6B" fontWeight="bold">
                Сбросить фильтры
              </Text>
            </Button>
          )}
        </YStack>
      </YStack>
    </ScrollView>
  )
}