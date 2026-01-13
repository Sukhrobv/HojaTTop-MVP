import "react-native-get-random-values";
import React from 'react'
import { TamaguiProvider, PortalProvider } from 'tamagui'
import tamaguiConfig from './tamagui.config'
import Navigation from '@/navigation'
import 'react-native-gesture-handler'
import { LanguageProvider } from '@/i18n'

export default function App() {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <PortalProvider>
        <LanguageProvider>
          <Navigation />
        </LanguageProvider>
      </PortalProvider>
    </TamaguiProvider>
  )
}
