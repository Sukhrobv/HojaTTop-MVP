import React, { useState } from 'react'
import { ScrollView, YStack, XStack, Text, Button, Input, Spinner } from 'tamagui'
import { Alert, KeyboardAvoidingView, Platform } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { 
  User, 
  UserPlus, 
  Mail,
  AlertCircle,
  CheckCircle,
  LogIn
} from 'lucide-react-native'
import { RootStackParamList } from '@/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from '@/i18n'

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Auth'>

type AuthMode = 'choose' | 'login' | 'register'

export default function AuthScreen() {
  const navigation = useNavigation<NavigationProp>()
  const { register, login, isAuthenticated, loading: authLoading } = useAuth()
  const { t } = useTranslation()
  
  // Form state
  const [authMode, setAuthMode] = useState<AuthMode>('choose')
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showEmailField, setShowEmailField] = useState(false)

  // If already authenticated, show different content
  if (isAuthenticated) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$4" space="$4">
        <CheckCircle size={64} color="#4CAF50" />
        <Text fontSize={20} fontWeight="bold" textAlign="center" color="#1A1A1A">
          {t('auth.already', 'Вы уже авторизованы!')}
        </Text>
        <Button 
          size="$5" 
          backgroundColor="#4ECDC4"
          onPress={() => navigation.goBack()}
        >
          <Text color="white" fontWeight="600">
            {t('auth.back', 'Вернуться назад')}
          </Text>
        </Button>
      </YStack>
    )
  }

  // Login handler
  const handleLogin = async () => {
    if (!userName.trim()) {
      Alert.alert(t('auth.login.error.title', 'Ошибка входа'), t('auth.login.missingUser', 'Введите имя пользователя'))
      return
    }

    if (!password) {
      Alert.alert(t('auth.login.error.title', 'Ошибка входа'), t('auth.login.missingPass', 'Введите пароль'))
      return
    }

    setSubmitting(true)

    try {
      const result = await login({
        userName: userName.trim(),
        password: password
      })

      if (result.success) {
        Alert.alert(
          t('auth.login.success.title', 'С возвращением!'),
          t('auth.login.success.body', 'Рады видеть вас снова, {name}!').replace('{name}', result.user?.userName || ''),
          [{
            text: 'OK',
            onPress: () => navigation.goBack()
          }]
        )
      } else {
        Alert.alert(
          t('auth.login.error.title', 'Ошибка входа'),
          result.error || t('auth.login.error.body', 'Неверное имя пользователя или пароль')
        )
      }
    } catch (error) {
      console.error('Login error:', error)
      Alert.alert(t('auth.login.error.title', 'Ошибка входа'), t('auth.login.error.generic', 'Произошла ошибка при входе'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleRegister = async () => {
    // Validation
    if (!userName.trim()) {
      Alert.alert(t('auth.register.error.title', 'Ошибка регистрации'), t('auth.login.missingUser', 'Введите имя пользователя'))
      return
    }

    if (userName.trim().length < 2) {
      Alert.alert(t('auth.register.error.title', 'Ошибка регистрации'), t('auth.register.userShort', 'Имя пользователя должно содержать минимум 2 символа'))
      return
    }

    if (!password || password.length < 6) {
      Alert.alert(t('auth.register.error.title', 'Ошибка регистрации'), t('auth.register.passShort', 'Пароль должен содержать минимум 6 символов'))
      return
    }

    if (showEmailField && email.trim() && !isValidEmail(email.trim())) {
      Alert.alert(t('auth.register.error.title', 'Ошибка регистрации'), t('auth.register.emailInvalid', 'Введите корректный email'))
      return
    }

    setSubmitting(true)

    try {
      const result = await register({
        userName: userName.trim(),
        password: password,
        email: showEmailField && email.trim() ? email.trim() : undefined
      })

      if (result.success) {
        Alert.alert(
          t('auth.register.success.title', 'Добро пожаловать!'),
          t('auth.register.success.body', 'Регистрация прошла успешно, {name}!').replace('{name}', result.user?.userName || ''),
          [{
            text: 'OK',
            onPress: () => navigation.goBack()
          }]
        )
      } else {
        Alert.alert(
          t('auth.register.error.title', 'Ошибка регистрации'),
          result.error || t('auth.register.error.body', 'Неизвестная ошибка')
        )
      }
    } catch (error) {
      console.error('Registration error:', error)
      Alert.alert(
        t('auth.register.error.title', 'Ошибка регистрации'),
        t('auth.register.error.generic', 'Произошла ошибка при регистрации')
      )
    } finally {
      setSubmitting(false)
    }
  }

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const isFormValid = userName.trim().length >= 2 && 
    password.length >= 6 &&
    (!showEmailField || !email.trim() || isValidEmail(email.trim()))

  // ADDED: Choice screen
  if (authMode === 'choose') {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$4" space="$4">
        
        {/* Header */}
        <YStack alignItems="center" space="$3">
          <YStack
            width={80}
            height={80}
            backgroundColor="#4ECDC420"
            borderRadius={40}
            alignItems="center"
            justifyContent="center"
          >
            <User size={40} color="#4ECDC4" />
          </YStack>
          
          <YStack alignItems="center" space="$2">
            <Text fontSize={24} fontWeight="bold" textAlign="center" color="#1A1A1A">
              {t('auth.choose.title', 'Добро пожаловать!')}
            </Text>
            <Text fontSize={16} color="#666666" textAlign="center">
              {t('auth.choose.subtitle', 'Выберите действие для продолжения')}
            </Text>
          </YStack>
        </YStack>

        {/* Action buttons */}
        <YStack space="$3" width="100%">
          <Button 
            size="$5" 
            backgroundColor="#4ECDC4"
            pressStyle={{ backgroundColor: '#3BA99C' }}
            onPress={() => setAuthMode('login')}
            icon={LogIn}
          >
            <Text color="white" fontWeight="600">
              {t('auth.choose.login', 'Войти в аккаунт')}
            </Text>
          </Button>
          
          <Button 
            size="$5" 
            backgroundColor="#FF6B6B"
            pressStyle={{ backgroundColor: '#E55555' }}
            onPress={() => setAuthMode('register')}
            icon={UserPlus}
          >
            <Text color="white" fontWeight="600">
              {t('auth.choose.register', 'Создать профиль')}
            </Text>
          </Button>
          
          <Button 
            variant="outlined"
            size="$4"
            onPress={() => navigation.goBack()}
            borderColor="$borderColor"
          >
            <Text color="#666666">
              {t('auth.choose.skip', 'Пропустить (остаться анонимным)')}
            </Text>
          </Button>
        </YStack>

        {/* Info */}
        <YStack
          backgroundColor="#4ECDC415"
          borderRadius="$3"
          padding="$3"
          borderLeftWidth={4}
          borderLeftColor="#4ECDC4"
        >
          <XStack alignItems="flex-start" space="$2">
            <AlertCircle size={16} color="#4ECDC4" style={{ marginTop: 2 }} />
            <YStack flex={1} space="$1">
              <Text fontSize={14} fontWeight="600" color="#1A1A1A">
                {t('auth.choose.why.title', 'Зачем нужна регистрация?')}
              </Text>
              <Text fontSize={13} color="#666666" lineHeight={18}>
                - {t('auth.choose.why.item1', 'Ваши отзывы будут подписаны вашим именем')}
                {'\n'}- {t('auth.choose.why.item2', 'Неограниченное количество отзывов')}
                {'\n'}- {t('auth.choose.why.item3', 'Возможность переключиться в анонимный режим')}
              </Text>
            </YStack>
          </XStack>
        </YStack>
      </YStack>
    )
  }

  // Login or Register form
  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        flex={1} 
        backgroundColor="$background"
        keyboardShouldPersistTaps="handled"
      >
        <YStack padding="$4" space="$4" flex={1} justifyContent="center">
          
          {/* Header */}
          <YStack alignItems="center" space="$3">
            <YStack
              width={80}
              height={80}
              backgroundColor={authMode === 'login' ? "#4ECDC420" : "#FF6B6B20"}
              borderRadius={40}
              alignItems="center"
              justifyContent="center"
            >
              {authMode === 'login' ? (
                <LogIn size={40} color="#4ECDC4" />
              ) : (
                <UserPlus size={40} color="#FF6B6B" />
              )}
            </YStack>
            
            <YStack alignItems="center" space="$2">
              <Text fontSize={24} fontWeight="bold" textAlign="center" color="#1A1A1A">
                {authMode === 'login' ? t('auth.form.loginTitle', 'Вход в аккаунт') : t('auth.form.registerTitle', 'Создание профиля')}
              </Text>
              <Text fontSize={16} color="#666666" textAlign="center">
                {authMode === 'login' 
                  ? t('auth.form.loginSubtitle', 'Введите данные для входа')
                  : t('auth.form.registerSubtitle', 'Создайте профиль для добавления отзывов')
                }
              </Text>
            </YStack>
          </YStack>

          {/* Form */}
          <YStack space="$4">
            
            {/* Username Field */}
            <YStack space="$2">
              <XStack alignItems="center" space="$2">
                <User size={16} color="#666666" />
                <Text fontSize={16} fontWeight="600" color="#1A1A1A">
                  {t('auth.field.username', 'Имя пользователя *')}
                </Text>
              </XStack>
              <Input
                placeholder={
                  authMode === 'login'
                    ? t('auth.field.username.placeholder.login', 'Ваше имя')
                    : t('auth.field.username.placeholder.register', 'Введите ваше имя')
                }
                value={userName}
                onChangeText={setUserName}
                size="$5"
                backgroundColor="$backgroundFocus"
                borderColor="$borderColor"
                borderRadius="$3"
                maxLength={30}
                autoCapitalize="words"
                autoComplete="name"
                returnKeyType="next"
              />
              <Text fontSize={12} color="#666666">
                {authMode === 'login' 
                  ? t('auth.field.username.hint.login', 'Введите имя, которое использовали при регистрации')
                  : t('auth.field.username.hint.register', 'Это имя будет отображаться в ваших отзывах')
                }
              </Text>
            </YStack>

            {/* Password Field */}
            <YStack space="$2">
              <XStack alignItems="center" space="$2">
                <User size={16} color="#666666" />
                <Text fontSize={16} fontWeight="600" color="#1A1A1A">
                  {t('auth.field.password', 'Пароль *')}
                </Text>
              </XStack>
              <Input
                placeholder={t('auth.field.password.placeholder', 'Введите пароль')}
                value={password}
                onChangeText={setPassword}
                size="$5"
                backgroundColor="$backgroundFocus"
                borderColor="$borderColor"
                borderRadius="$3"
                secureTextEntry
                returnKeyType="done"
              />
              <Text fontSize={12} color="#666666">
                {t('auth.field.password.hint', 'Минимум 6 символов')}
              </Text>
            </YStack>

            {/* Email Field Toggle (only for registration) */}
            {authMode === 'register' && (
              <YStack space="$2">
                <Button
                  variant="outlined"
                  size="$4"
                  onPress={() => setShowEmailField(!showEmailField)}
                  borderColor="$borderColor"
                >
                  <XStack alignItems="center" space="$2">
                    <Mail size={16} color="#666666" />
                    <Text color="#1A1A1A">
                      {showEmailField
                        ? t('auth.field.email.toggle.hide', 'Скрыть email')
                        : t('auth.field.email.toggle.show', 'Добавить email (необязательно)')}
                    </Text>
                  </XStack>
                </Button>
                
                {showEmailField && (
                  <>
                    <Input
                      placeholder="example@email.com"
                      value={email}
                      onChangeText={setEmail}
                      size="$5"
                      backgroundColor="$backgroundFocus"
                      borderColor="$borderColor"
                      borderRadius="$3"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      returnKeyType="done"
                    />
                    <Text fontSize={12} color="#666666">
                      {t('auth.field.email.hint', 'Email нужен только для восстановления аккаунта')}
                    </Text>
                  </>
                )}
              </YStack>
            )}

            {/* Submit Button */}
            <Button 
              size="$5" 
              backgroundColor={isFormValid ? (authMode === 'login' ? "#4ECDC4" : "#FF6B6B") : "$backgroundPress"}
              pressStyle={{ backgroundColor: isFormValid ? (authMode === 'login' ? '#3BA99C' : '#E55555') : '$backgroundPress' }}
              onPress={authMode === 'login' ? handleLogin : handleRegister}
              disabled={!isFormValid || submitting || authLoading}
              borderRadius="$3"
            >
              {submitting || authLoading ? (
                <XStack alignItems="center" space="$2">
                  <Spinner size="small" color="white" />
                  <Text color="white" fontWeight="600">
                    {authMode === 'login'
                      ? t('auth.submit.login', 'Вход...')
                      : t('auth.submit.register', 'Создание...')}
                  </Text>
                </XStack>
              ) : (
                <Text color={isFormValid ? "white" : "#666666"} fontWeight="600">
                  {authMode === 'login'
                    ? t('auth.submit.login.cta', 'Войти')
                    : t('auth.submit.register.cta', 'Создать профиль')}
                </Text>
              )}
            </Button>

            {/* Switch mode */}
            <YStack alignItems="center" space="$2">
              <Text fontSize={14} color="#666666">
                {authMode === 'login'
                  ? t('auth.switch.noAccount', 'Нет аккаунта?')
                  : t('auth.switch.haveAccount', 'Уже есть аккаунт?')}
              </Text>
              <Button 
                variant="outlined"
                size="$3"
                onPress={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                borderColor="$borderColor"
              >
                <Text color="#4ECDC4" fontWeight="600">
                  {authMode === 'login'
                    ? t('auth.switch.toRegister', 'Создать аккаунт')
                    : t('auth.switch.toLogin', 'Войти в существующий')}
                </Text>
              </Button>
            </YStack>

            {/* Back to choice */}
            <Button 
              variant="outlined"
              size="$4"
              onPress={() => setAuthMode('choose')}
              borderColor="$borderColor"
            >
              <Text color="#666666">
                {t('auth.backToChoose', '← Назад к выбору')}
              </Text>
            </Button>
          </YStack>
        </YStack>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}


