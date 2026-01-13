import React, { useEffect, useState } from 'react'
import { ScrollView, YStack, XStack, Text, Button, Card, Separator } from 'tamagui'
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
  Award,
  Globe,
} from 'lucide-react-native'
import { RootStackParamList } from '@/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation, availableLanguages } from '@/i18n'

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>

const colors = {
  primary: '#4ECDC4',
  secondary: '#FF6B6B',
  telegram: '#229ED9',
  bg: '#F8F9FA',
  cardBg: '#FFFFFF',
  text: '#2D3436',
  textLight: '#636E72',
}

const SettingsItem = ({
  icon: Icon,
  title,
  subtitle,
  onPress,
  rightComponent,
  color = colors.primary,
  isLast = false,
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
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
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
          backgroundColor={color + '15'}
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
            <Text fontSize={13} color={colors.textLight} lineHeight={18} numberOfLines={2}>
              {subtitle}
            </Text>
          )}
        </YStack>

        {rightComponent || <ChevronRight size={20} color="#D1D5DB" />}
      </XStack>
      {!isLast && <Separator marginHorizontal="$4" borderColor="#F0F2F5" />}
    </TouchableOpacity>
  )
}

export default function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>()
  const { isAuthenticated, user, getCurrentDisplayName, logout, toggleAnonymousMode } = useAuth()
  const { language, setLanguage, t } = useTranslation()

  const [currentDisplayName, setCurrentDisplayName] = useState('')

  useEffect(() => {
    setCurrentDisplayName(getCurrentDisplayName())
  }, [user?.useAnonymousMode, user?.userName, user?.id, isAuthenticated, getCurrentDisplayName])

  const handleTelegramContact = () => {
    Linking.openURL('https://t.me/gottoto')
  }

  const handleLogout = async () => {
    const success = await logout()
    if (success) Alert.alert(t('settings.logout.success', 'Вы вышли из аккаунта'))
  }

  const confirmLogout = () => {
    Alert.alert(
      t('settings.logout.title', 'Выход'),
      t('settings.logout.confirm', 'Выйти из аккаунта?'),
      [
        { text: t('settings.logout.cancel', 'Отмена'), style: 'cancel' },
        { text: t('settings.logout.submit', 'Выйти'), style: 'destructive', onPress: handleLogout },
      ],
    )
  }

  const handleAnonymousToggle = async () => {
    if (!user) return
    const result = await toggleAnonymousMode()
    if (result.success) setCurrentDisplayName(result.newDisplayName)
  }

  const formatReviews = (count: number) => `${count} ${t('settings.reviews', 'отзывов')}`
  const accountActiveText = t('settings.account.active', 'Аккаунт активен')
  const anonymousTitle = t('settings.anonymous.title', 'Анонимный режим')

  const LanguageToggle = () => (
    <XStack backgroundColor="#F0F2F5" borderRadius="$4" padding={2} height={32} alignItems="center">
      {availableLanguages.map((l) => {
        const active = language === l.code
        return (
          <Button
            key={l.code}
            size="$2"
            unstyled
            backgroundColor={active ? 'white' : 'transparent'}
            borderRadius="$3"
            paddingHorizontal="$3"
            height="100%"
            onPress={() => setLanguage(l.code)}
            shadowColor={active ? '#000' : 'transparent'}
            shadowOpacity={active ? 0.08 : 0}
            shadowRadius={active ? 2 : 0}
          >
            <Text fontSize={13} fontWeight={active ? '700' : '500'} color={active ? colors.text : colors.textLight}>
              {l.label}
            </Text>
          </Button>
        )
      })}
    </XStack>
  )

  const authInfo =
    isAuthenticated && user
      ? {
          title: currentDisplayName,
          subtitle: user.useAnonymousMode
            ? `${anonymousTitle} · ${formatReviews(user.reviewCount)}`
            : `${formatReviews(user.reviewCount)} · ${accountActiveText}`,
          icon: user.useAnonymousMode ? Shield : User,
          color: colors.primary,
        }
      : {
          title: t('settings.login', 'Войти в профиль'),
          subtitle: t('settings.login.subtitle', 'Чтобы оставлять отзывы и влиять на рейтинг'),
          icon: UserPlus,
          color: colors.primary,
        }

  return (
    <ScrollView flex={1} backgroundColor={colors.bg} contentContainerStyle={{ paddingBottom: 40 }}>
      <YStack padding="$4" space="$5">
        {/* Профиль */}
        <YStack space="$3">
          <Text
            fontSize={14}
            fontWeight="700"
            color={colors.textLight}
            marginLeft="$2"
            textTransform="uppercase"
          >
            {t('settings.section.profile', 'Профиль')}
          </Text>
          <Card borderRadius="$5" backgroundColor={colors.cardBg} elevation={1} overflow="hidden">
            <SettingsItem
              icon={authInfo.icon}
              title={authInfo.title}
              subtitle={authInfo.subtitle}
              onPress={() => !isAuthenticated && navigation.navigate('Auth')}
              color={authInfo.color}
              rightComponent={
                isAuthenticated ? (
                  <TouchableOpacity onPress={confirmLogout} style={{ padding: 8 }}>
                    <LogOut size={20} color={colors.secondary} />
                  </TouchableOpacity>
                ) : undefined
              }
              isLast={!isAuthenticated}
            />

            {isAuthenticated && user && (
              <SettingsItem
                icon={user.useAnonymousMode ? EyeOff : Eye}
                title={anonymousTitle}
                subtitle={user.useAnonymousMode ? t('settings.anonymous.on', 'Имя скрыто в отзывах') : t('settings.anonymous.off', 'Имя видно другим')}
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

        {/* Сообщество */}
        <YStack space="$3">
          <Text
            fontSize={14}
            fontWeight="700"
            color={colors.textLight}
            marginLeft="$2"
            textTransform="uppercase"
          >
            {t('settings.section.community', 'Сообщество и развитие')}
          </Text>
          <Card borderRadius="$5" backgroundColor={colors.cardBg} elevation={1} overflow="hidden">
            <SettingsItem
              icon={MapPin}
              title={t('settings.addPoint.title', 'Добавить точку')}
              subtitle={t('settings.addPoint.subtitle', 'Знаете предпринимателя или хорошее место? Напишите нам')}
              onPress={handleTelegramContact}
              color={colors.telegram}
            />
            <SettingsItem
              icon={Award}
              title={t('settings.moderator.title', 'Стать модератором')}
              subtitle={t('settings.moderator.subtitle', 'Помогайте проверять данные и фотографии')}
              onPress={handleTelegramContact}
              color="#FF9800"
              isLast={true}
            />

            <YStack backgroundColor="#F0F9FF" padding="$3.5">
              <XStack space="$2">
                <MessageCircle size={18} color={colors.telegram} style={{ marginTop: 2 }} />
                <Text fontSize={13} color="#005A8D" flex={1} lineHeight={18}>
                  {t(
                    'settings.community.info',
                    'Пока точки добавляет админ. Напишите в Telegram — добавим быстро.',
                  )}
                </Text>
              </XStack>
            </YStack>
          </Card>
        </YStack>

        {/* Приложение */}
        <YStack space="$3">
          <Text
            fontSize={14}
            fontWeight="700"
            color={colors.textLight}
            marginLeft="$2"
            textTransform="uppercase"
          >
            {t('settings.section.app', 'Приложение')}
          </Text>
          <Card borderRadius="$5" backgroundColor={colors.cardBg} elevation={1} overflow="hidden">
            <SettingsItem
              icon={Globe}
              title={t('settings.language', 'Язык интерфейса')}
              onPress={() => {}}
              color="#607D8B"
              rightComponent={<LanguageToggle />}
            />
            <Separator marginHorizontal="$4" borderColor="#F0F2F5" />
            <SettingsItem
              icon={Palette}
              title={t('settings.appearance', 'Внешний вид')}
              subtitle={t('settings.appearance.subtitle', 'Светлая тема')}
              onPress={() => Alert.alert('Пока недоступно', 'Скоро добавим переключение темы')}
              color="#607D8B"
            />
            <SettingsItem
              icon={Bell}
              title={t('settings.notifications', 'Уведомления')}
              subtitle={t('settings.notifications.subtitle', 'Отключены')}
              onPress={() => Alert.alert('Пока недоступно', 'Скоро добавим настройки уведомлений')}
              color="#607D8B"
              isLast={true}
            />
          </Card>
        </YStack>

        {/* Манифест */}
        <YStack space="$3" marginTop="$2">
          <Card
            borderRadius="$5"
            backgroundColor="#E0F2F1"
            borderWidth={1}
            borderColor="#B2DFDB"
            padding="$4"
            elevation={0}
          >
            <XStack space="$3" alignItems="flex-start">
              <Heart size={24} color={colors.primary} fill={colors.primary} />
              <YStack flex={1} space="$2">
                <Text fontSize={16} fontWeight="700" color="#00695C">
                  {t(
                    'settings.manifest.title',
                    'HojaTTop — это не просто карта. Мы строим культуру уважения к человеческому достоинству.',
                  )}
                </Text>
                <Text fontSize={14} color="#004D40" lineHeight={20}>
                  {t(
                    'settings.manifest.body',
                    'Делитесь честными точками и отзывами, помогайте людям заранее понимать условия и чувствовать себя в безопасности. Каждая точка — это забота о достоинстве и комфорте.',
                  )}
                </Text>
                <Text fontSize={12} color="#00695C" opacity={0.7} marginTop="$2">
                  {t('settings.manifest.version', 'Версия: 1.0.0 (Beta)')}
                </Text>
              </YStack>
            </XStack>
          </Card>
        </YStack>

        {isAuthenticated && user && __DEV__ && (
          <YStack opacity={0.5} marginTop="$4">
            <Text fontSize={10} textAlign="center">
              Dev ID: {user.id}
            </Text>
          </YStack>
        )}
      </YStack>
    </ScrollView>
  )
}
