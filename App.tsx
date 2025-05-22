import React from 'react'
import { TamaguiProvider } from 'tamagui'
import tamaguiConfig from './tamagui.config'
import Navigation from '@/navigation'

export default function App() {
  return (
    <TamaguiProvider config={tamaguiConfig}>
      <Navigation />
    </TamaguiProvider>
  )
}