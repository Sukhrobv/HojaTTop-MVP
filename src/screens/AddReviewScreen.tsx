import React, { useState, useRef, useEffect } from 'react'
import { ScrollView, YStack, XStack, Text, Button, TextArea, Spinner, Switch, Sheet } from 'tamagui'
import { Alert, Pressable, KeyboardAvoidingView, Platform, Keyboard } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RouteProp } from '@react-navigation/native'
import { 
  HelpCircle, 
  Accessibility,
  Baby,
  Droplets,
  DollarSign,
  X,
  UserPlus,
  AlertCircle,
  ShoppingBag,
  Droplet,
  Sparkles,
  Shield
} from 'lucide-react-native'
import { RootStackParamList } from '@/navigation'
import { useReviews } from '@/hooks/useReviews'
import { useAuth } from '@/hooks/useAuth'
import { Review } from '@/types'
import RatingSelector from '@components/RatingSelector'

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddReview'>
type RouteProps = RouteProp<RootStackParamList, 'AddReview'>

// Color scheme with UNIFIED feature-specific colors
const colors = {
  primary: '#4ECDC4',
  secondary: '#FF6B6B', 
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  accent: '#9C27B0',
  neutral: '#6E7AA1',
  // UNIFIED feature-specific colors (same everywhere)
  accessibility: '#2196F3', // Blue for accessibility
  babyChanging: '#FF9800',  // Orange for baby changing
  ablution: '#00BCD4',      // Light blue for ablution
}

const rewardMock = {
  title: 'Спасибо за отзыв!',
  subtitle: 'Мы начислили примерный бонус за этот отзыв.',
  rewardLabel: 'Ваш бонус',
  code: 'THANKS2025',
  terms: 'Покажите этот код сотруднику в течение 7 дней. Это демонстрация награды.'
}

// Feature toggle with fixed size, icon only, feature-specific colors
const FeatureToggle = ({ 
  icon: Icon, 
  active, 
  onToggle,
  type = 'default'
}: { 
  icon: any
  active: boolean
  onToggle: () => void
  type?: 'accessibility' | 'babyChanging' | 'ablution' | 'default'
}) => {
  const getFeatureColor = () => {
    switch (type) {
      case 'accessibility': return colors.accessibility
      case 'babyChanging': return colors.babyChanging
      case 'ablution': return colors.ablution
      default: return colors.primary
    }
  }

  const featureColor = getFeatureColor()

  return (
    <Pressable onPress={onToggle}>
      <YStack 
        alignItems="center" 
        justifyContent="center"
        width={60}
        height={60}
        borderRadius="$3"
        backgroundColor={active ? featureColor + '20' : '$backgroundPress'}
        borderWidth={2}
        borderColor={active ? featureColor : '$borderColor'}
      >
        <Icon 
          size={28} 
          color={active ? featureColor : colors.neutral} 
        />
      </YStack>
    </Pressable>
  )
}

// Help modal component
const HelpModal = ({ 
  open, 
  onClose,
  title,
  content
}: { 
  open: boolean
  onClose: () => void
  title: string 
  content: React.ReactNode
}) => (
  <Sheet modal open={open} onOpenChange={onClose} snapPoints={[63]} dismissOnSnapToBottom>
    <Sheet.Frame>
      <Sheet.Handle />
      <YStack padding="$4" space="$3" paddingBottom="$5">
        <XStack alignItems="center" justifyContent="space-between">
          <Text fontSize={18} fontWeight="bold">{title}</Text>
          <Pressable onPress={onClose}>
            <X size={20} color={colors.neutral} />
          </Pressable>
        </XStack>
        {content}
      </YStack>
    </Sheet.Frame>
    <Sheet.Overlay
      enterStyle={{ opacity: 0 }}
      exitStyle={{ opacity: 0 }}
      backgroundColor="rgba(0,0,0,0.4)"
    />
  </Sheet>
)

export default function AddReviewScreen() {
  const navigation = useNavigation<NavigationProp>()
  const route = useRoute<RouteProps>()
  const { toiletId } = route.params

  const { addNewReview } = useReviews(toiletId)
  const { isAuthenticated, isRegistered, user, getCurrentDisplayName } = useAuth()
  
  // Refs for scrolling
  const scrollViewRef = useRef<any>(null)
  
  // Form state
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [bottomPadding, setBottomPadding] = useState(20) // Dynamic padding state, default 20
  
  // Feature toggles
  const [hasAccessibility, setHasAccessibility] = useState(false)
  const [hasBabyChanging, setHasBabyChanging] = useState(false)
  const [hasAblution, setHasAblution] = useState(false)
  
  // Payment status
  const [isPaid, setIsPaid] = useState(false)
  
  // Help modals
  const [showRatingHelp, setShowRatingHelp] = useState(false)
  const [showFeaturesHelp, setShowFeaturesHelp] = useState(false)

  // Handle keyboard appearance
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setBottomPadding(120) // Increase padding when keyboard shows
        // Wait a bit for the keyboard to fully open/layout to adjust
        setTimeout(() => {
          // Scroll to the bottom where the comment input is
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }, 100)
      }
    )

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setBottomPadding(20) // Reset padding when keyboard hides
      }
    )

    return () => {
      keyboardDidShowListener.remove()
      keyboardDidHideListener.remove()
    }
  }, [])

  // Check if user can leave reviews
  const canLeaveReview = isAuthenticated && isRegistered

  const handleSubmit = async () => {
    if (!canLeaveReview) {
      Alert.alert(
        'Требуется регистрация', 
        'Для добавления отзывов необходимо зарегистрироваться в приложении',
        [
          { text: 'Отмена', style: 'cancel' },
          { 
            text: 'Зарегистрироваться', 
            onPress: () => navigation.navigate('Auth')
          }
        ]
      )
      return
    }

    // Validation
    if (rating === 0) {
      Alert.alert('Ошибка', 'Пожалуйста, поставьте оценку')
      return
    }

    if (comment.length > 500) {
      Alert.alert('Ошибка', 'Комментарий не должен превышать 500 символов')
      return
    }

    setSubmitting(true)

    try {
      const reviewData: Omit<Review, 'id' | 'createdAt'> & {
        featureMentions?: {
          accessibility: boolean
          babyChanging: boolean
          ablution: boolean
          isPaid: boolean
        }
      } = {
        toiletId,
        userId: user?.id || 'anonymous',
        userName: getCurrentDisplayName(),
        rating: rating / 2, // Convert 10-point to 5-point
        cleanliness: rating / 2,
        accessibility: rating / 2,
        comment: comment.trim(),
        photos: [],
        featureMentions: {
          accessibility: hasAccessibility,
          babyChanging: hasBabyChanging,
          ablution: hasAblution,
          isPaid: isPaid
        }
      }

      const success = await addNewReview(reviewData)

      if (success) {
        Keyboard.dismiss()
        navigation.navigate('ToiletDetail', { 
          toiletId, 
          reward: rewardMock
        })
        return
      } else {
        Alert.alert(
          'Ошибка',
          'Не удалось добавить отзыв. Проверьте интернет-соединение и попробуйте снова.'
        )
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      Alert.alert(
        'Ошибка',
        'Произошла ошибка при отправке отзыва'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoToAuth = () => {
    navigation.navigate('Auth')
  }

  const isFormValid = rating > 0
  const commentLength = comment.length

  if (!canLeaveReview) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$4" space="$4">
        <YStack
          width={80}
          height={80}
          backgroundColor="#FF6B6B20"
          borderRadius={40}
          alignItems="center"
          justifyContent="center"
        >
          <UserPlus size={40} color="#FF6B6B" />
        </YStack>
        
        <YStack alignItems="center" space="$2">
          <Text fontSize={20} fontWeight="bold" textAlign="center" color="#1A1A1A">
            Нужна регистрация
          </Text>
          <Text fontSize={16} color="#666666" textAlign="center">
            Для добавления отзывов необходимо зарегистрироваться в приложении
          </Text>
        </YStack>

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
                Почему нужна регистрация?
              </Text>
              <Text fontSize={13} color="#666666" lineHeight={18}>
                • Отзывы будут подписаны вашим именем{'\n'}
                • Защита от спама и фальшивых отзывов{'\n'}
                • Возможность редактировать свои отзывы
              </Text>
            </YStack>
          </XStack>
        </YStack>

        <YStack space="$3" width="100%">
          <Button 
            size="$5" 
            backgroundColor="#4ECDC4"
            pressStyle={{ backgroundColor: '#3BA99C' }}
            onPress={handleGoToAuth}
          >
            <Text color="white" fontWeight="600">
              Зарегистрироваться
            </Text>
          </Button>
          
          <Button 
            variant="outlined"
            size="$4"
            onPress={() => navigation.goBack()}
            borderColor="$borderColor"
          >
            <Text color="#666666">
              Вернуться назад
            </Text>
          </Button>
        </YStack>
      </YStack>
    )
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView 
        ref={scrollViewRef}
        flex={1} 
        backgroundColor="$background"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: bottomPadding }}
      >
        <YStack paddingHorizontal="$2" paddingVertical="$3" space="$3">
          
          {/* User info header */}
          <YStack 
            backgroundColor="#4ECDC415" 
            borderRadius="$3" 
            padding="$3"
            borderLeftWidth={4}
            borderLeftColor="#4ECDC4"
          >
            <Text fontSize={14} color="#1A1A1A">
              Отзыв будет опубликован от имени: <Text fontWeight="bold">{getCurrentDisplayName()}</Text>
            </Text>
            <Text fontSize={12} color="#666666" marginTop="$1">
              {user?.useAnonymousMode 
                ? 'Вы в анонимном режиме' 
                : 'Можно переключиться в анонимный режим в настройках'
              }
            </Text>
          </YStack>

          {/* Rating Section */}
          <YStack 
            backgroundColor="$background" 
            borderRadius="$3" 
            padding="$4"
            borderWidth={1}
            borderColor="$borderColor"
            space="$3"
          >
            <XStack alignItems="center" justifyContent="space-between">
              <Text fontSize={18} fontWeight="bold" color="#1A1A1A">
                Оценка точки
              </Text>
              <Pressable onPress={() => setShowRatingHelp(true)}>
                <HelpCircle size={20} color={colors.neutral} />
              </Pressable>
            </XStack>
            
            <RatingSelector
              value={rating}
              onChange={setRating}
            />
          </YStack>

          {/* Features Section */}
          <YStack 
            backgroundColor="$background" 
            borderRadius="$3" 
            padding="$4"
            borderWidth={1}
            borderColor="$borderColor"
            space="$3"
          >
            <XStack alignItems="center" justifyContent="space-between">
              <Text fontSize={18} fontWeight="bold" color="#1A1A1A">
                Удобства
              </Text>
              <Pressable onPress={() => setShowFeaturesHelp(true)}>
                <HelpCircle size={20} color={colors.neutral} />
              </Pressable>
            </XStack>
            
            <XStack space="$3" justifyContent="center">
              <FeatureToggle
                icon={Accessibility}
                active={hasAccessibility}
                onToggle={() => setHasAccessibility(!hasAccessibility)}
                type="accessibility"
              />
              <FeatureToggle
                icon={Baby}
                active={hasBabyChanging}
                onToggle={() => setHasBabyChanging(!hasBabyChanging)}
                type="babyChanging"
              />
              <FeatureToggle
                icon={Droplets}
                active={hasAblution}
                onToggle={() => setHasAblution(!hasAblution)}
                type="ablution"
              />
            </XStack>
          </YStack>

          {/* Payment Status */}
          <YStack 
            backgroundColor="$background" 
            borderRadius="$3" 
            padding="$4"
            borderWidth={1}
            borderColor="$borderColor"
            space="$3"
          >
            <Text fontSize={18} fontWeight="bold" color="#1A1A1A">
              Доступность
            </Text>
            
            <XStack alignItems="center" justifyContent="space-between">
              <XStack alignItems="center" space="$2">
                <Text fontSize={16} color="#1A1A1A">
                  {isPaid ? 'Платный' : 'Бесплатный'}
                </Text>
              </XStack>
              <Switch
                size="$4"
                checked={isPaid}
                onCheckedChange={setIsPaid}
                backgroundColor={isPaid ? colors.error + '40' : colors.success + '40'}
              >
                <Switch.Thumb 
                  animation="bouncy" 
                  backgroundColor={isPaid ? colors.error : colors.success}
                />
              </Switch>
            </XStack>
          </YStack>

          {/* Comment Section */}
          <YStack 
            backgroundColor="$background" 
            borderRadius="$3" 
            padding="$4"
            borderWidth={1}
            borderColor="$borderColor"
            space="$3"
            marginBottom="$4"
          >
            <Text fontSize={18} fontWeight="bold" color="#1A1A1A">
              Комментарий (необязательно)
            </Text>
            
            <YStack space="$2">
              <TextArea
                placeholder="Поделитесь вашим опытом: что понравилось, что можно улучшить..."
                value={comment}
                onChangeText={setComment}
                numberOfLines={4}
                minHeight={120}
                maxLength={500}
                backgroundColor="$backgroundFocus"
                borderColor="$borderColor"
                borderWidth={1}
                borderRadius="$3"
                padding="$3"
                fontSize={14}
                returnKeyType="default"
                textAlignVertical="top"
                onFocus={() => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true })
                  }, 100)
                }}
              />
              <XStack justifyContent="space-between" alignItems="center">
                {/* <Text fontSize={12} color="#666666">
                  Расскажите подробнее о вашем опыте
                </Text> */}
                <Text fontSize={12} color={commentLength > 450 ? colors.error : '#666666'}>
                  {commentLength}/500
                </Text>
              </XStack>
            </YStack>
          </YStack>

          {/* Submit Button */}
          <YStack paddingBottom="$4">
            <Button 
              size="$5" 
              backgroundColor={isFormValid ? colors.secondary : "$backgroundPress"}
              pressStyle={{ backgroundColor: isFormValid ? '#E55555' : '$backgroundPress' }}
              onPress={handleSubmit}
              disabled={!isFormValid || submitting}
              borderRadius="$3"
            >
              {submitting ? (
                <XStack alignItems="center" space="$2">
                  <Spinner size="small" color="white" />
                  <Text color="white" fontWeight="bold">
                    Отправка...
                  </Text>
                </XStack>
              ) : (
                <Text color={isFormValid ? "white" : "#666666"} fontWeight="bold">
                  Отправить отзыв
                </Text>
              )}
            </Button>
          </YStack>
        </YStack>
      </ScrollView>

      {/* Help Modals */}
      <HelpModal
        open={showRatingHelp}
        onClose={() => setShowRatingHelp(false)}
        title="Что важно при оценке?"
        content={
          <YStack space="$4">
            <YStack space="$3">
              <XStack space="$3" alignItems="flex-start">
                <YStack 
                  width={44} 
                  height={44} 
                  borderRadius="$full" 
                  backgroundColor={colors.primary + '20'}
                  alignItems="center"
                  justifyContent="center"
                  alignSelf="flex-start"
                >
                  <ShoppingBag size={25} color={colors.primary} strokeWidth={2.4} />
                </YStack>
                <YStack flex={1} space="$1">
                  <Text fontWeight="700" fontSize={14} color="#1A1A1A">«Тест на крючок»</Text>
                  <Text fontSize={13} color="#555E6D">Есть ли крючок/полка для сумки или куртки?</Text>
                </YStack>
              </XStack>

              <XStack space="$3" alignItems="flex-start">
                <YStack 
                  width={44} 
                  height={44} 
                  borderRadius="$full" 
                  backgroundColor={colors.primary + '20'}
                  alignItems="center"
                  justifyContent="center"
                  alignSelf="flex-start"
                >
                  <Droplet size={25} color={colors.primary} strokeWidth={2.4} />
                </YStack>
                <YStack flex={1} space="$1">
                  <Text fontWeight="700" fontSize={14} color="#1A1A1A">Гигиена и вода</Text>
                  <Text fontSize={13} color="#555E6D">Есть ли вода, мыло и условия для омовения?</Text>
                </YStack>
              </XStack>

              <XStack space="$3" alignItems="flex-start">
                <YStack 
                  width={44} 
                  height={44} 
                  borderRadius="$full" 
                  backgroundColor={colors.primary + '20'}
                  alignItems="center"
                  justifyContent="center"
                  alignSelf="flex-start"
                >
                  <Sparkles size={25} color={colors.primary} strokeWidth={2.4} />
                </YStack>
                <YStack flex={1} space="$1">
                  <Text fontWeight="700" fontSize={14} color="#1A1A1A">Чистота и запах</Text>
                  <Text fontSize={13} color="#555E6D">Чистый пол, сантехника, нет резкого запаха.</Text>
                </YStack>
              </XStack>

              <XStack space="$3" alignItems="flex-start">
                <YStack 
                  width={44} 
                  height={44} 
                  borderRadius="$full" 
                  backgroundColor={colors.primary + '20'}
                  alignItems="center"
                  justifyContent="center"
                  alignSelf="flex-start"
                >
                  <Shield size={25} color={colors.primary} strokeWidth={2.4} />
                </YStack>
                <YStack flex={1} space="$1">
                  <Text fontWeight="700" fontSize={14} color="#1A1A1A">Приватность</Text>
                  <Text fontSize={13} color="#555E6D">Исправен ли замок? Чувствуете безопасность?</Text>
                </YStack>
              </XStack>
            </YStack>

            <YStack space="$2">
              <Text fontWeight="700" fontSize={14} color="#1A1A1A">Шпаргалка по звёздам</Text>
              <YStack space="$1.5">
                <Text fontSize={13}>
                  <Text fontWeight="700" color="#D64545">1 — Критично.</Text>
                  <Text color="#6A6F80"> Грязно, сломано, страшно зайти.</Text>
                </Text>
                <Text fontSize={13}>
                  <Text fontWeight="700" color="#7A8190">3 — База.</Text>
                  <Text color="#6A6F80"> Чисто, но не хватает мыла/крючка/бумаги.</Text>
                </Text>
                <Text fontSize={13}>
                  <Text fontWeight="700" color={colors.primary}>5 — Идеал.</Text>
                  <Text color="#6A6F80"> Чисто, есть крючок, мыло, вода — комфортно.</Text>
                </Text>
              </YStack>
            </YStack>
          </YStack>
        }
      />

      <HelpModal
        open={showFeaturesHelp}
        onClose={() => setShowFeaturesHelp(false)}
        title="Что считается удобством?"
        content={
          <YStack space="$4">
            <Text fontSize={13} color="#555E6D">
              Отмечайте только то, что реально работает и доступно посетителям.
            </Text>

            <YStack space="$3">
              <XStack space="$3" alignItems="flex-start">
                <YStack 
                  width={44} 
                  height={44} 
                  borderRadius="$full" 
                  backgroundColor={colors.accessibility + '20'}
                  alignItems="center"
                  justifyContent="center"
                  alignSelf="flex-start"
                >
                  <Accessibility size={24} color={colors.accessibility} strokeWidth={2.2} />
                </YStack>
                <YStack flex={1} space="$1">
                  <Text fontWeight="900" fontSize={14} color="#1A1A1A">Доступная среда</Text>
                  <Text fontSize={13} color="#555E6D" lineHeight={19}>
                    Пандус (не крутой), широкие двери, поручни. Реальная возможность заехать на коляске.
                  </Text>
                </YStack>
              </XStack>

              <XStack space="$3" alignItems="flex-start">
                <YStack 
                  width={44} 
                  height={44} 
                  borderRadius="$full" 
                  backgroundColor={colors.babyChanging + '20'}
                  alignItems="center"
                  justifyContent="center"
                  alignSelf="flex-start"
                >
                  <Baby size={24} color={colors.babyChanging} strokeWidth={2.2} />
                </YStack>
                <YStack flex={1} space="$1">
                  <Text fontWeight="900" fontSize={14} color="#1A1A1A">Родителям и малышам</Text>
                  <Text fontSize={13} color="#555E6D" lineHeight={19}>
                    Пеленальный столик или чистая безопасная поверхность для ухода за ребёнком.
                  </Text>
                </YStack>
              </XStack>

              <XStack space="$3" alignItems="flex-start">
                <YStack 
                  width={44} 
                  height={44} 
                  borderRadius="$full" 
                  backgroundColor={colors.ablution + '20'}
                  alignItems="center"
                  justifyContent="center"
                  alignSelf="flex-start"
                >
                  <Droplets size={24} color={colors.ablution} strokeWidth={2.2} />
                </YStack>
                <YStack flex={1} space="$1">
                  <Text fontWeight="900" fontSize={14} color="#1A1A1A">Условия для омовения</Text>
                  <Text fontSize={13} color="#555E6D" lineHeight={19}>
                    Кувшин (обдаста), низкий кран/шланг, сухая зона для подготовки. Подходит для тахарата.
                  </Text>
                </YStack>
              </XStack>
            </YStack>

            <XStack 
              marginTop="$1" 
              padding="$3" 
              backgroundColor="$backgroundFocus" 
              borderRadius="$4"
              borderWidth={1}
              borderColor="$borderColor"
            >
              <Text fontSize={13} color="#4A5568">
                <Text fontWeight="900" color={colors.primary}>Ваша помощь:</Text> честно отмечая эти пункты, вы помогаете людям заранее планировать маршрут и избегать стресса.
              </Text>
            </XStack>
          </YStack>
        }
      />
    </KeyboardAvoidingView>
  )
}
