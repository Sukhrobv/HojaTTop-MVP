import "react-native-get-random-values";
import React from 'react'
import { TamaguiProvider } from 'tamagui'
import tamaguiConfig from './tamagui.config'
import Navigation from '@/navigation'
import 'react-native-gesture-handler'

export default function App() {
  return (
    <TamaguiProvider config={tamaguiConfig}>
      <Navigation />
    </TamaguiProvider>
  )
}