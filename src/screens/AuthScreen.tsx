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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Auth'>

type AuthMode = 'choose' | 'login' | 'register'

export default function AuthScreen() {
  const navigation = useNavigation<NavigationProp>()
  const { register, isAuthenticated, loading: authLoading } = useAuth()
  
  // Form state
  const [authMode, setAuthMode] = useState<AuthMode>('choose')
  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showEmailField, setShowEmailField] = useState(false)

  // If already authenticated, show different content
  if (isAuthenticated) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$4" space="$4">
        <CheckCircle size={64} color="#4CAF50" />
        <Text fontSize={20} fontWeight="bold" textAlign="center" color="#1A1A1A">
          Вы уже авторизованы!
        </Text>
        <Button 
          size="$5" 
          backgroundColor="#4ECDC4"
          onPress={() => navigation.goBack()}
        >
          <Text color="white" fontWeight="600">
            Вернуться назад
          </Text>
        </Button>
      </YStack>
    )
  }

  // ADDED: Login handler (simple username check)
  const handleLogin = async () => {
    if (!userName.trim()) {
      Alert.alert('Ошибка', 'Введите имя пользователя')
      return
    }

    if (userName.trim().length < 2) {
      Alert.alert('Ошибка', 'Имя пользователя должно содержать минимум 2 символа')
      return
    }

    setSubmitting(true)

    try {
      // TODO: Implement real login logic
      // For now, we'll simulate a login attempt
      Alert.alert(
        'Вход временно недоступен',
        'Пока что можно только зарегистрироваться. В будущих версиях добавим полноценный вход в аккаунт.',
        [
          { text: 'Понятно', style: 'cancel' },
          { 
            text: 'Зарегистрироваться', 
            onPress: () => setAuthMode('register')
          }
        ]
      )
    } catch (error) {
      console.error('Login error:', error)
      Alert.alert('Ошибка', 'Произошла ошибка при входе')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRegister = async () => {
    // Validation
    if (!userName.trim()) {
      Alert.alert('Ошибка', 'Введите имя пользователя')
      return
    }

    if (userName.trim().length < 2) {
      Alert.alert('Ошибка', 'Имя пользователя должно содержать минимум 2 символа')
      return
    }

    if (showEmailField && email.trim() && !isValidEmail(email.trim())) {
      Alert.alert('Ошибка', 'Введите корректный email')
      return
    }

    setSubmitting(true)

    try {
      const result = await register({
        userName: userName.trim(),
        email: showEmailField && email.trim() ? email.trim() : undefined
      })

      if (result.success) {
        Alert.alert(
          'Добро пожаловать!',
          `Регистрация прошла успешно, ${result.user?.userName}!`,
          [{
            text: 'OK',
            onPress: () => navigation.goBack()
          }]
        )
      } else {
        Alert.alert('Ошибка регистрации', result.error || 'Неизвестная ошибка')
      }
    } catch (error) {
      console.error('Registration error:', error)
      Alert.alert('Ошибка', 'Произошла ошибка при регистрации')
    } finally {
      setSubmitting(false)
    }
  }

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const isFormValid = userName.trim().length >= 2 && 
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
              Добро пожаловать!
            </Text>
            <Text fontSize={16} color="#666666" textAlign="center">
              Выберите действие для продолжения
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
              Войти в аккаунт
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
              Создать новый аккаунт
            </Text>
          </Button>
          
          <Button 
            variant="outlined"
            size="$4"
            onPress={() => navigation.goBack()}
            borderColor="$borderColor"
          >
            <Text color="#666666">
              Пропустить (остаться анонимным)
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
                Зачем нужна регистрация?
              </Text>
              <Text fontSize={13} color="#666666" lineHeight={18}>
                • Ваши отзывы будут подписаны вашим именем{'\n'}
                • Неограниченное количество отзывов{'\n'}
                • Возможность переключиться в анонимный режим
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
                {authMode === 'login' ? 'Вход в аккаунт' : 'Регистрация'}
              </Text>
              <Text fontSize={16} color="#666666" textAlign="center">
                {authMode === 'login' 
                  ? 'Введите данные для входа'
                  : 'Создайте аккаунт для добавления отзывов'
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
                  Имя пользователя *
                </Text>
              </XStack>
              <Input
                placeholder={authMode === 'login' ? 'Ваше имя' : 'Введите ваше имя'}
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
                  ? 'Введите имя, которое использовали при регистрации'
                  : 'Это имя будет отображаться в ваших отзывах'
                }
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
                      {showEmailField ? 'Скрыть email' : 'Добавить email (необязательно)'}
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
                      Email нужен только для восстановления аккаунта
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
                    {authMode === 'login' ? 'Вход...' : 'Регистрация...'}
                  </Text>
                </XStack>
              ) : (
                <Text color={isFormValid ? "white" : "#666666"} fontWeight="600">
                  {authMode === 'login' ? 'Войти' : 'Зарегистрироваться'}
                </Text>
              )}
            </Button>

            {/* Switch mode */}
            <YStack alignItems="center" space="$2">
              <Text fontSize={14} color="#666666">
                {authMode === 'login' ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
              </Text>
              <Button 
                variant="outlined"
                size="$3"
                onPress={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                borderColor="$borderColor"
              >
                <Text color="#4ECDC4" fontWeight="600">
                  {authMode === 'login' ? 'Создать аккаунт' : 'Войти в существующий'}
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
                ← Назад к выбору
              </Text>
            </Button>
          </YStack>
        </YStack>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}