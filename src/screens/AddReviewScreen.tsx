import React, { useState, useRef } from 'react'
import { ScrollView, YStack, XStack, Text, Button, TextArea, Spinner, Switch, Sheet } from 'tamagui'
import { Alert, Pressable, KeyboardAvoidingView, Platform } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RouteProp } from '@react-navigation/native'
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  Accessibility,
  Baby,
  Droplets,
  DollarSign,
  X,
  UserPlus,
  AlertCircle
} from 'lucide-react-native'
import { RootStackParamList } from '@/navigation'
import { useReviews } from '@/hooks/useReviews'
import { useAuth } from '@/hooks/useAuth' // ADDED: Import auth hook
import { Review } from '@/types'
import StarSliderRating from '@components/StarSliderRating'

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
  content: string[]
}) => (
  <Sheet modal open={open} onOpenChange={onClose} snapPoints={[50]} dismissOnSnapToBottom>
    <Sheet.Frame>
      <Sheet.Handle />
      <YStack padding="$4" space="$3">
        <XStack alignItems="center" justifyContent="space-between">
          <Text fontSize={18} fontWeight="bold">{title}</Text>
          <Pressable onPress={onClose}>
            <X size={20} color={colors.neutral} />
          </Pressable>
        </XStack>
        
        <YStack space="$2">
          {content.map((item, index) => (
            <Text key={index} fontSize={14} color="#666666">
              • {item}
            </Text>
          ))}
        </YStack>
      </YStack>
    </Sheet.Frame>
  </Sheet>
)

export default function AddReviewScreen() {
  const navigation = useNavigation<NavigationProp>()
  const route = useRoute<RouteProps>()
  const { toiletId } = route.params

  const { addNewReview } = useReviews(toiletId)
  const { isAuthenticated, isRegistered, user, getCurrentDisplayName } = useAuth() // ADDED: Use auth hook
  
  // Refs for scrolling
  const scrollViewRef = useRef<any>(null)
  const commentSectionRef = useRef<any>(null)

  // Form state (using 10-point scale, only one rating)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  
  // Feature toggles (like Yandex Taxi)
  const [hasAccessibility, setHasAccessibility] = useState(false)
  const [hasBabyChanging, setHasBabyChanging] = useState(false)
  const [hasAblution, setHasAblution] = useState(false)
  
  // Payment status
  const [isPaid, setIsPaid] = useState(false)
  
  // Help modals
  const [showRatingHelp, setShowRatingHelp] = useState(false)
  const [showFeaturesHelp, setShowFeaturesHelp] = useState(false)

  // ADDED: Check if user can leave reviews
  const canLeaveReview = isAuthenticated && isRegistered

  const handleSubmit = async () => {
    // UPDATED: Check if user can leave reviews
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
      // UPDATED: Use real user data instead of hardcoded values
      const reviewData: Omit<Review, 'id' | 'createdAt'> & {
        featureMentions?: {
          accessibility: boolean
          babyChanging: boolean
          ablution: boolean
          isPaid: boolean
        }
      } = {
        toiletId,
        userId: user?.id || 'anonymous', // Use real user ID
        userName: getCurrentDisplayName(), // Use current display name (handles anonymous mode)
        rating: rating / 2, // Convert 10-point to 5-point
        cleanliness: rating / 2, // Use same rating
        accessibility: rating / 2, // Use same rating
        comment: comment.trim(),
        photos: [], // TODO: Add photo upload functionality
        // Add feature mentions for counting
        featureMentions: {
          accessibility: hasAccessibility,
          babyChanging: hasBabyChanging,
          ablution: hasAblution,
          isPaid: isPaid
        }
      }

      const success = await addNewReview(reviewData)

      if (success) {
        Alert.alert(
          'Успешно!', 
          'Ваш отзыв добавлен и будет виден другим пользователям',
          [{ 
            text: 'OK', 
            onPress: () => {
              // Small delay to ensure data is synced
              setTimeout(() => {
                navigation.goBack()
              }, 500)
            }
          }]
        )
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

  // ADDED: Show registration prompt if not authenticated
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
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView 
        ref={scrollViewRef}
        flex={1} 
        backgroundColor="$background"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <YStack paddingHorizontal="$2" paddingVertical="$3" space="$3">
          
          {/* ADDED: User info header */}
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
                Оценка туалета
              </Text>
              <Pressable onPress={() => setShowRatingHelp(true)}>
                <HelpCircle size={20} color={colors.neutral} />
              </Pressable>
            </XStack>
            
            <StarSliderRating
              value={rating}
              onChange={setRating}
              maxStars={10}
              starSize={28}
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
              Стоимость
            </Text>
            
            <XStack alignItems="center" justifyContent="space-between">
              <XStack alignItems="center" space="$2">
                <DollarSign size={20} color={isPaid ? colors.error : colors.success} />
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
            ref={commentSectionRef}
            backgroundColor="$background" 
            borderRadius="$3" 
            padding="$4"
            borderWidth={1}
            borderColor="$borderColor"
            space="$3"
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
                returnKeyType="done"
                blurOnSubmit={true}
                textAlignVertical="top"
                onFocus={() => {
                  setTimeout(() => {
                    commentSectionRef.current?.measureLayout?.(
                      scrollViewRef.current,
                      (x: number, y: number) => {
                        scrollViewRef.current?.scrollTo({
                          y: y - 50,
                          animated: true
                        })
                      }
                    )
                  }, 300)
                }}
              />
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize={12} color="#666666">
                  Расскажите подробнее о вашем опыте
                </Text>
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
        title="Как оценивать?"
        content={[
          "Поставьте оценку от 1 до 10 звезд",
          "1-2 звезды: Ужасное состояние",
          "3-4 звезды: Плохое состояние", 
          "5-6 звезд: Нормальное состояние",
          "7-8 звезд: Хорошее состояние",
          "9-10 звезд: Отличное состояние",
          "Можно нажимать на звездочки или перетаскивать"
        ]}
      />

      <HelpModal
        open={showFeaturesHelp}
        onClose={() => setShowFeaturesHelp(false)}
        title="Про удобства"
        content={[
          "Отметьте, какие удобства есть в туалете",
          "Доступность: пандусы, широкие двери, поручни",
          "Пеленальный столик: для смены подгузников",
          "Омовение: специальные условия для ритуального омовения"
        ]}
      />
    </KeyboardAvoidingView>
  )
}