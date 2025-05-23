// Utility to load sample data into Firestore
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { db, COLLECTIONS } from '@/services/firebase'
import { sampleToilets, sampleReviews } from '@/services/sampleData'

export async function clearCollection(collectionName: string) {
  const querySnapshot = await getDocs(collection(db, collectionName))
  const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref))
  await Promise.all(deletePromises)
}

// Fix incomplete toilet documents
export async function fixIncompleteToilets() {
  const toiletsSnapshot = await getDocs(collection(db, COLLECTIONS.TOILETS))
  
  const updatePromises = toiletsSnapshot.docs.map(async (docSnap) => {
    const data = docSnap.data()
    
    // Check if features is missing or incomplete
    if (!data.features || typeof data.features !== 'object') {
      const updatedData = {
        features: {
          isAccessible: data.features?.isAccessible || false,
          hasBabyChanging: data.features?.hasBabyChanging || false,
          hasAblution: data.features?.hasAblution || false,
          isFree: data.features?.isFree || false
        },
        rating: data.rating || 0,
        reviewCount: data.reviewCount || 0,
        photos: data.photos || [],
        lastUpdated: Date.now()
      }
      
      await updateDoc(doc(db, COLLECTIONS.TOILETS, docSnap.id), updatedData)
    }
  })
  
  await Promise.all(updatePromises)
}

export async function loadSampleToilets() {
  try {
    // First, fix any incomplete documents
    await fixIncompleteToilets()
    
    const toiletIds: string[] = []
    
    // Add toilets
    for (const toilet of sampleToilets) {
      const docRef = await addDoc(collection(db, COLLECTIONS.TOILETS), toilet)
      toiletIds.push(docRef.id)
    }
    
    // Add sample reviews for first few toilets
    for (let i = 0; i < Math.min(3, toiletIds.length); i++) {
      for (const review of sampleReviews) {
        const reviewData = { ...review, toiletId: toiletIds[i] }
        await addDoc(collection(db, COLLECTIONS.REVIEWS), reviewData)
      }
    }
    
    return toiletIds
    
  } catch (error) {
    console.error('Error loading sample data:', error)
    throw error
  }
}