import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

// Import screens
import MapScreen from '@screens/MapScreen'
import ToiletDetailScreen from '@screens/ToiletDetailScreen'
import AddReviewScreen from '@screens/AddReviewScreen'
import FiltersScreen from '@screens/FiltersScreen'
// ADD THESE TWO IMPORTS:
import SettingsScreen from '@screens/SettingsScreen'
import AuthScreen from '@screens/AuthScreen'
import { Filters } from '@/types'

// Define navigation params type
export type RootStackParamList = {
  Map: undefined
  ToiletDetail: { toiletId: string; reward?: {
    title?: string
    subtitle?: string
    rewardLabel?: string
    code?: string
    terms?: string
    accentColor?: string
  } }
  AddReview: { toiletId: string }
  Filters: {
    initialFilters?: Filters
    onApply?: (filters: Filters) => void
  }
  Settings: undefined
  Auth: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Map"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#4ECDC4',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Map" 
          component={MapScreen}
          options={{ 
            title: 'HojaTTop',
            headerShown: false // Map screen will have custom header
          }}
        />
        <Stack.Screen 
          name="ToiletDetail" 
          component={ToiletDetailScreen}
          options={{ title: 'Детали' }}
        />
        <Stack.Screen 
          name="AddReview" 
          component={AddReviewScreen}
          options={{ title: 'Добавить отзыв' }}
        />
        <Stack.Screen 
          name="Filters" 
          component={FiltersScreen}
          options={{ 
            title: 'Фильтры',
            presentation: 'modal' // Show as modal
          }}
        />
        {/* ADD THESE TWO SCREENS: */}
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{ 
            title: 'Настройки',
            presentation: 'modal'
          }}
        />
        <Stack.Screen 
          name="Auth" 
          component={AuthScreen}
          options={{ 
            title: 'Авторизация',
            presentation: 'modal'
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
