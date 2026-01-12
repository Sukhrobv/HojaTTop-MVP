import React, { useState, useEffect } from 'react'
import { ScrollView, YStack, XStack, Text, Button, Card, Separator } from 'tamagui'
import { TouchableOpacity, Alert, Switch } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { 
  User, 
  UserPlus, 
  LogIn,
  LogOut,
  Palette, 
  Bell, 
  Info, 
  ChevronRight,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react-native'
import { RootStackParamList } from '@/navigation'
import { useAuth } from '@/hooks/useAuth'

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>

// Settings menu item component with fixed colors and TouchableOpacity
const SettingsItem = ({
  icon: Icon,
  title,
  subtitle,
  onPress,
  rightComponent,
  color = '#4ECDC4'
}: {
  icon: any
  title: string
  subtitle?: string
  onPress: () => void
  rightComponent?: React.ReactNode
  color?: string
}) => {
  return (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flex: 1,
        minHeight: 60,
      }}
    >
      <XStack
        alignItems="center"
        paddingVertical="$3"
        paddingHorizontal="$4"
        backgroundColor="$background"
        space="$3"
        minHeight={60}
      >
        <YStack
          width={36}
          height={36}
          backgroundColor={color + '15'}
          borderRadius={18}
          alignItems="center"
          justifyContent="center"
        >
          <Icon size={18} color={color} />
        </YStack>
        
        <YStack flex={1} space="$1">
          <Text fontSize={16} fontWeight="600" color="#1A1A1A">
            {title}
          </Text>
          {subtitle && (
            <Text 
              fontSize={13}
              color="#666666"
              lineHeight={18}
              numberOfLines={2}
            >
              {subtitle}
            </Text>
          )}
        </YStack>
        
        {rightComponent || (
          <ChevronRight size={18} color="#666666" />
        )}
      </XStack>
    </TouchableOpacity>
  )
}

export default function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>()
  const { isAuthenticated, isRegistered, user, getCurrentDisplayName, logout, toggleAnonymousMode } = useAuth()
  
  // State to force re-render when user data changes
  const [currentDisplayName, setCurrentDisplayName] = useState('')
  
  // Update display name when user changes OR when component mounts/updates
  useEffect(() => {
    setCurrentDisplayName(getCurrentDisplayName())
  }, [user?.useAnonymousMode, user?.userName, user?.id, isAuthenticated, getCurrentDisplayName])

  // ALTERNATIVE: Listen to navigation focus events
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setCurrentDisplayName(getCurrentDisplayName())
    })

    return unsubscribe
  }, [navigation, getCurrentDisplayName])

  const handleAuthPress = () => {
    if (isAuthenticated) {
      // Show logout confirmation
      Alert.alert(
        'Выйти из аккаунта',
        'Вы уверены, что хотите выйти? Все данные останутся сохранены.',
        [
          { text: 'Отмена', style: 'cancel' },
          { 
            text: 'Выйти', 
            style: 'destructive',
            onPress: handleLogout
          }
        ]
      )
    } else {
      navigation.navigate('Auth')
    }
  }

  // Logout handler
  const handleLogout = async () => {
    const success = await logout()
    if (success) {
      Alert.alert('Успешно', 'Вы вышли из аккаунта')
    } else {
      Alert.alert('Ошибка', 'Не удалось выйти из аккаунта')
    }
  }

  // Anonymous mode toggle handler
  const handleAnonymousToggle = async () => {
    if (!user) return

    const result = await toggleAnonymousMode()
    if (result.success) {
      // Update local state to reflect the change
      setCurrentDisplayName(result.newDisplayName)
      console.log('Anonymous mode toggled:', result.newDisplayName)
    } else {
      Alert.alert('Ошибка', result.error || 'Не удалось изменить режим')
    }
  }

  const handleThemePress = () => {
    Alert.alert('В разработке', 'Смена темы будет доступна в следующих обновлениях')
  }

  const handleNotificationsPress = () => {
    Alert.alert('В разработке', 'Настройки уведомлений будут доступны в следующих обновлениях')
  }

  const handleAboutPress = () => {
    Alert.alert(
      'О приложении HojaTTop',
      'Версия 1.0.0\n\nПриложение для поиска и оценки туалетов.\n\nРазработано с ❤️ для удобства горожан.',
      [{ text: 'OK' }]
    )
  }

  // Auth section title and subtitle
  const getAuthSectionInfo = () => {
    if (isAuthenticated && user) {
      return {
        title: currentDisplayName, // Use state variable
        subtitle: user.useAnonymousMode 
          ? `Анонимный режим • ${user.reviewCount} отзывов`
          : `${user.reviewCount} отзывов оставлено`,
        icon: user.useAnonymousMode ? Shield : User,
        showLogout: true
      }
    } else {
      return {
        title: 'Войти или зарегистрироваться',
        subtitle: 'Необходимо для добавления отзывов',
        icon: UserPlus,
        showLogout: false
      }
    }
  }

  const authInfo = getAuthSectionInfo()

  return (
    <ScrollView flex={1} backgroundColor="$background">
      <YStack padding="$4" space="$3">
        
        {/* Account Section */}
        <Card 
          borderRadius="$4"
          backgroundColor="$background"
          borderWidth={1}
          borderColor="$borderColor"
        >
          <Card.Header paddingBottom="$2">
            <Text fontSize={18} fontWeight="bold" color="#1A1A1A">
              Аккаунт
            </Text>
          </Card.Header>
          
          <Separator marginHorizontal="$4" />
          
          <SettingsItem
            icon={authInfo.icon}
            title={authInfo.title}
            subtitle={authInfo.subtitle}
            onPress={handleAuthPress}
            color="#4ECDC4"
            rightComponent={authInfo.showLogout ? (
              <LogOut size={18} color="#FF6B6B" />
            ) : undefined}
          />

          {/* Anonymous Mode Toggle for authenticated users */}
          {isAuthenticated && user && (
            <>
              <Separator marginLeft="$16" marginRight="$4" />
              
              <TouchableOpacity 
                onPress={handleAnonymousToggle}
                activeOpacity={0.7}
                style={{
                  flex: 1,
                  minHeight: 60,
                }}
              >
                <XStack
                  alignItems="center"
                  paddingVertical="$3"
                  paddingHorizontal="$4"
                  backgroundColor="$background"
                  space="$3"
                  minHeight={60}
                >
                  <YStack
                    width={36}
                    height={36}
                    backgroundColor={user.useAnonymousMode ? '#9C27B015' : '#2196F315'}
                    borderRadius={18}
                    alignItems="center"
                    justifyContent="center"
                  >
                    {user.useAnonymousMode ? (
                      <EyeOff size={18} color="#9C27B0" />
                    ) : (
                      <Eye size={18} color="#2196F3" />
                    )}
                  </YStack>
                  
                  <YStack flex={1} space="$1">
                    <Text fontSize={16} fontWeight="600" color="#1A1A1A">
                      Анонимный режим
                    </Text>
                    <Text 
                      fontSize={13}
                      color="#666666"
                      lineHeight={18}
                      numberOfLines={2}
                    >
                      {user.useAnonymousMode 
                        ? 'Ваши отзывы публикуются анонимно'
                        : 'Ваши отзывы публикуются под вашим именем'
                      }
                    </Text>
                  </YStack>
                  
                  <Switch
                    value={user.useAnonymousMode}
                    onValueChange={handleAnonymousToggle}
                    trackColor={{ 
                      false: '#E0E0E0', 
                      true: '#9C27B0' 
                    }}
                    thumbColor={user.useAnonymousMode ? '#FFFFFF' : '#FFFFFF'}
                    ios_backgroundColor="#E0E0E0"
                  />
                </XStack>
              </TouchableOpacity>
            </>
          )}
        </Card>

        {/* App Settings Section */}
        <Card 
          borderRadius="$4"
          backgroundColor="$background"
          borderWidth={1}
          borderColor="$borderColor"
        >
          <Card.Header paddingBottom="$2">
            <Text fontSize={18} fontWeight="bold" color="#1A1A1A">
              Настройки
            </Text>
          </Card.Header>
          
          <Separator marginHorizontal="$4" />
          
          <YStack>
            <SettingsItem
              icon={Palette}
              title="Тема оформления"
              subtitle="Светлая тема (скоро)"
              onPress={handleThemePress}
              color="#9C27B0"
            />
            
            <Separator marginLeft="$16" marginRight="$4" />
            
            <SettingsItem
              icon={Bell}
              title="Уведомления"
              subtitle="Настройки (скоро)"
              onPress={handleNotificationsPress}
              color="#FF9800"
            />
          </YStack>
        </Card>

        {/* About Section */}
        <Card 
          borderRadius="$4"
          backgroundColor="$background"
          borderWidth={1}
          borderColor="$borderColor"
        >
          <Card.Header paddingBottom="$2">
            <Text fontSize={18} fontWeight="bold" color="#1A1A1A">
              Информация
            </Text>
          </Card.Header>
          
          <Separator marginHorizontal="$4" />
          
          <SettingsItem
            icon={Info}
            title="О приложении"
            subtitle="HojaTTop версия 1.0.0"
            onPress={handleAboutPress}
            color="#2196F3"
          />
        </Card>

        {/* Debug Info (Development only) */}
        {isAuthenticated && user && __DEV__ && (
          <Card 
            borderRadius="$4"
            backgroundColor="$backgroundFocus"
            borderWidth={1}
            borderColor="$borderColorFocus"
            opacity={0.8}
          >
            <Card.Header paddingBottom="$2">
              <Text fontSize={16} fontWeight="600" color="#666666">
                Отладочная информация
              </Text>
            </Card.Header>
            
            <Separator marginHorizontal="$4" opacity={0.5} />
            
            <YStack padding="$4" space="$2">
              <Text fontSize={12} color="#666666">
                ID: {user.id.slice(0, 12)}...
              </Text>
              <Text fontSize={12} color="#666666">
                Анонимный ID: {user.anonymousId}
              </Text>
              <Text fontSize={12} color="#666666">
                Отзывов: {user.reviewCount}
              </Text>
              <Text fontSize={12} color="#666666">
                Зарегистрирован: {new Date(user.registeredAt).toLocaleDateString('ru-RU')}
              </Text>
              <Text fontSize={12} color="#666666">
                Текущий режим: {user.useAnonymousMode ? 'Анонимный' : 'Обычный'}
              </Text>
              <Text fontSize={12} color="#666666">
                Отображаемое имя: {currentDisplayName}
              </Text>
            </YStack>
          </Card>
        )}
      </YStack>
    </ScrollView>
  )
}