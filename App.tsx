import "react-native-get-random-values";
import React from 'react'
import { TamaguiProvider, PortalProvider } from 'tamagui'
import tamaguiConfig from './tamagui.config'
import Navigation from '@/navigation'
import 'react-native-gesture-handler'

export default function App() {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <PortalProvider>
        <Navigation />
      </PortalProvider>
    </TamaguiProvider>
  )
}
