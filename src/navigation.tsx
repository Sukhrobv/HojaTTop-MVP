import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

// Import screens (will be created next)
import MapScreen from '@screens/MapScreen'
import ToiletDetailScreen from '@screens/ToiletDetailScreen'
import AddReviewScreen from '@screens/AddReviewScreen'
import FiltersScreen from '@screens/FiltersScreen'

// Define navigation params type
export type RootStackParamList = {
  Map: undefined
  ToiletDetail: { toiletId: string }
  AddReview: { toiletId: string }
  Filters: undefined
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
      </Stack.Navigator>
    </NavigationContainer>
  )
}