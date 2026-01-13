import React, { useState, useEffect } from 'react'
import { ScrollView, YStack, XStack, Text, Button, Card, Separator, View } from 'tamagui'
import { TouchableOpacity, Alert, Switch, Linking } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { 
  User, 
  UserPlus, 
  LogOut,
  Palette, 
  Bell, 
  ChevronRight,
  Shield,
  Eye,
  EyeOff,
  MessageCircle,
  MapPin,
  Heart,
  Award
} from 'lucide-react-native'
import { RootStackParamList } from '@/navigation'
import { useAuth } from '@/hooks/useAuth'

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>

// Colors
const colors = {
  primary: '#4ECDC4',
  secondary: '#FF6B6B',
  telegram: '#229ED9',
  bg: '#F8F9FA',
  cardBg: '#FFFFFF',
  text: '#2D3436',
  textLight: '#636E72'
}

// Reusable Settings Item
const SettingsItem = ({
  icon: Icon,
  title,
  subtitle,
  onPress,
  rightComponent,
  color = colors.primary,
  isLast = false
}: {
  icon: any
  title: string
  subtitle?: string
  onPress: () => void
  rightComponent?: React.ReactNode
  color?: string
  isLast?: boolean
}) => {
  return (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <XStack
        alignItems="center"
        paddingVertical="$3.5"
        paddingHorizontal="$4"
        backgroundColor={colors.cardBg}
        space="$3.5"
      >
        <YStack
          width={40}
          height={40}
          backgroundColor={color + '15'} // 10-15% opacity
          borderRadius={20}
          alignItems="center"
          justifyContent="center"
        >
          <Icon size={20} color={color} strokeWidth={2} />
        </YStack>
        
        <YStack flex={1} space="$1">
          <Text fontSize={16} fontWeight="600" color={colors.text}>
            {title}
          </Text>
          {subtitle && (
            <Text 
              fontSize={13}
              color={colors.textLight}
              lineHeight={18}
              numberOfLines={2}
            >
              {subtitle}
            </Text>
          )}
        </YStack>
        
        {rightComponent || (
          <ChevronRight size={20} color="#D1D5DB" />
        )}
      </XStack>
      {!isLast && <Separator marginHorizontal="$4" borderColor="#F0F2F5" />}
    </TouchableOpacity>
  )
}

export default function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>()
  const { isAuthenticated, user, getCurrentDisplayName, logout, toggleAnonymousMode } = useAuth()
  
  const [currentDisplayName, setCurrentDisplayName] = useState('')
  
  useEffect(() => {
    setCurrentDisplayName(getCurrentDisplayName())
  }, [user?.useAnonymousMode, user?.userName, user?.id, isAuthenticated, getCurrentDisplayName])

  // Handlers
  const handleTelegramContact = () => {
    // ЗАМЕНИТЬ НА РЕАЛЬНЫЙ КОНТАКТ
    Linking.openURL('https://t.me/gottoto') 
  }

  const handleLogout = async () => {
    const success = await logout()
    if (success) Alert.alert('Успешно', 'Вы вышли из аккаунта')
  }

  const confirmLogout = () => {
    Alert.alert(
      'Выход',
      'Вы уверены?',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Выйти', style: 'destructive', onPress: handleLogout }
      ]
    )
  }

  const handleAnonymousToggle = async () => {
    if (!user) return
    const result = await toggleAnonymousMode()
    if (result.success) setCurrentDisplayName(result.newDisplayName)
  }

  // --- Auth Info Logic ---
  const authInfo = isAuthenticated && user ? {
    title: currentDisplayName,
    subtitle: user.useAnonymousMode 
      ? `Анонимный режим • ${user.reviewCount} отзывов`
      : `${user.reviewCount} отзывов • Аккаунт активен`,
    icon: user.useAnonymousMode ? Shield : User,
    color: colors.primary
  } : {
    title: 'Войти в профиль',
    subtitle: 'Чтобы оставлять отзывы и влиять на рейтинг',
    icon: UserPlus,
    color: colors.primary
  }

  return (
    <ScrollView flex={1} backgroundColor={colors.bg} contentContainerStyle={{ paddingBottom: 40 }}>
      <YStack padding="$4" space="$5">
        
        {/* 1. Блок Аккаунта */}
        <YStack space="$3">
          <Text fontSize={14} fontWeight="700" color={colors.textLight} marginLeft="$2" textTransform="uppercase">
            Мой профиль
          </Text>
          <Card borderRadius="$5" backgroundColor={colors.cardBg} elevation={1} overflow="hidden">
            <SettingsItem
              icon={authInfo.icon}
              title={authInfo.title}
              subtitle={authInfo.subtitle}
              onPress={() => !isAuthenticated && navigation.navigate('Auth')}
              color={authInfo.color}
              rightComponent={isAuthenticated ? (
                <TouchableOpacity onPress={confirmLogout} style={{ padding: 8 }}>
                   <LogOut size={20} color={colors.secondary} />
                </TouchableOpacity>
              ) : undefined}
              isLast={!isAuthenticated}
            />

            {isAuthenticated && user && (
              <SettingsItem
                icon={user.useAnonymousMode ? EyeOff : Eye}
                title="Анонимный режим"
                subtitle={user.useAnonymousMode 
                  ? "Ваше имя скрыто в отзывах" 
                  : "Показывать имя публично"}
                onPress={handleAnonymousToggle}
                color="#9C27B0"
                rightComponent={
                  <Switch
                    value={user.useAnonymousMode}
                    onValueChange={handleAnonymousToggle}
                    trackColor={{ false: '#E0E0E0', true: '#9C27B0' }}
                    thumbColor={'white'}
                  />
                }
                isLast={true}
              />
            )}
          </Card>
        </YStack>

        {/* 2. Блок "Сотрудничество" (ГЛАВНОЕ НОВОВВЕДЕНИЕ) */}
        <YStack space="$3">
          <Text fontSize={14} fontWeight="700" color={colors.textLight} marginLeft="$2" textTransform="uppercase">
            Сообщество и Развитие
          </Text>
          <Card borderRadius="$5" backgroundColor={colors.cardBg} elevation={1} overflow="hidden">
            {/* Добавить точку */}
            <SettingsItem
              icon={MapPin}
              title="Добавить точку"
              subtitle="Вы владелец заведения или знаете хорошее место?"
              onPress={handleTelegramContact}
              color={colors.telegram}
            />
            {/* Стать активистом */}
            <SettingsItem
              icon={Award}
              title="Стать модератором"
              subtitle="Помогите нам проверять чистоту данных и фото."
              onPress={handleTelegramContact}
              color="#FF9800"
              isLast={true}
            />
            
            {/* Инфо-плашка внутри карточки */}
            <YStack backgroundColor="#F0F9FF" padding="$3.5">
              <XStack space="$2">
                <MessageCircle size={18} color={colors.telegram} style={{ marginTop: 2 }} />
                <Text fontSize={13} color="#005A8D" flex={1} lineHeight={18}>
                  Пока добавление точек работает через администратора. Напишите нам в Telegram — мы быстро всё добавим!
                </Text>
              </XStack>
            </YStack>
          </Card>
        </YStack>

        {/* 3. Обычные настройки */}
        <YStack space="$3">
          <Text fontSize={14} fontWeight="700" color={colors.textLight} marginLeft="$2" textTransform="uppercase">
            Приложение
          </Text>
          <Card borderRadius="$5" backgroundColor={colors.cardBg} elevation={1} overflow="hidden">
            <SettingsItem
              icon={Palette}
              title="Внешний вид"
              subtitle="Светлая тема"
              onPress={() => Alert.alert('Скоро', 'Темная тема в разработке 🌙')}
              color="#607D8B"
            />
            <SettingsItem
              icon={Bell}
              title="Уведомления"
              subtitle="Выключены"
              onPress={() => Alert.alert('Скоро', 'Настройка уведомлений в разработке 🔔')}
              color="#607D8B"
              isLast={true}
            />
          </Card>
        </YStack>

        {/* 4. Блок Миссии (Manifesto) */}
        <YStack space="$3" marginTop="$2">
           <Card 
             borderRadius="$5" 
             backgroundColor="#E0F2F1" // Очень светлый мятный
             borderWidth={1}
             borderColor="#B2DFDB"
             padding="$4"
             elevation={0}
           >
             <XStack space="$3" alignItems="flex-start">
               <Heart size={24} color={colors.primary} fill={colors.primary} />
               <YStack flex={1} space="$2">
                 <Text fontSize={16} fontWeight="700" color="#00695C">
                   Наша миссия — Фаросат
                 </Text>
                 <Text fontSize={14} color="#004D40" lineHeight={20}>
                   HojaTTop — это не просто карта. Мы строим культуру уважения к человеческому достоинству. 
                   {"\n\n"}
                   Чистый туалет, наличие воды и крючка для сумки — это норма, а не роскошь. Спасибо, что помогаете делать город комфортнее!
                 </Text>
                 <Text fontSize={12} color="#00695C" opacity={0.7} marginTop="$2">
                   Версия приложения: 1.0.0 (Beta)
                 </Text>
               </YStack>
             </XStack>
           </Card>
        </YStack>

        {/* Debug Info (Only for Devs) */}
        {isAuthenticated && user && __DEV__ && (
          <YStack opacity={0.5} marginTop="$4">
             <Text fontSize={10} textAlign="center">Dev ID: {user.id}</Text>
          </YStack>
        )}

      </YStack>
    </ScrollView>
  )
}