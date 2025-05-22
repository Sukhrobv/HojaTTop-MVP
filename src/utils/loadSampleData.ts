// Utility to load sample data into Firestore
import { collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore'
import { db, COLLECTIONS } from '@/services/firebase'
import { sampleToilets, sampleReviews } from '@/services/sampleData'

export async function clearCollection(collectionName: string) {
  const querySnapshot = await getDocs(collection(db, collectionName))
  const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref))
  await Promise.all(deletePromises)
  console.log(`Cleared ${querySnapshot.size} documents from ${collectionName}`)
}

export async function loadSampleToilets() {
  try {
    console.log('Loading sample toilets...')
    
    // Clear existing data (optional)
    // await clearCollection(COLLECTIONS.TOILETS)
    
    const toiletIds: string[] = []
    
    // Add toilets
    for (const toilet of sampleToilets) {
      const docRef = await addDoc(collection(db, COLLECTIONS.TOILETS), toilet)
      toiletIds.push(docRef.id)
      console.log(`Added toilet: ${toilet.name} with ID: ${docRef.id}`)
    }
    
    console.log(`Successfully loaded ${toiletIds.length} toilets`)
    
    // Add sample reviews for first few toilets
    console.log('Loading sample reviews...')
    
    for (let i = 0; i < Math.min(3, toiletIds.length); i++) {
      for (const review of sampleReviews) {
        const reviewData = { ...review, toiletId: toiletIds[i] }
        await addDoc(collection(db, COLLECTIONS.REVIEWS), reviewData)
      }
    }
    
    console.log('Sample data loaded successfully!')
    return toiletIds
    
  } catch (error) {
    console.error('Error loading sample data:', error)
    throw error
  }
}