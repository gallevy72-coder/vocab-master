// Check if we're in demo mode
const DEMO_MODE = !import.meta.env.VITE_FIREBASE_API_KEY ||
                  import.meta.env.VITE_FIREBASE_API_KEY === 'demo-api-key';

const STORAGE_KEY = 'vocab_master_demo';

function getDemoStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { users: {}, currentUser: null, wordLists: [], textUnits: [], progress: [] };
  } catch {
    return { users: {}, currentUser: null, wordLists: [], textUnits: [], progress: [] };
  }
}

function setDemoStorage(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ==================== Word Lists ====================

export async function createWordList(teacherId, name, words) {
  const listData = {
    id: 'list_' + Date.now(),
    teacherId,
    name,
    words: words.map((word, index) => ({
      id: word.id || `word_${Date.now()}_${index}`,
      en: word.en,
      he: word.he,
      difficulty: word.difficulty || 1,
      imageUrl: word.imageUrl || null,
      audioUrl: word.audioUrl || null,
    })),
    createdAt: new Date().toISOString(),
  };

  if (DEMO_MODE) {
    const storage = getDemoStorage();
    storage.wordLists = storage.wordLists || [];
    storage.wordLists.unshift(listData);
    setDemoStorage(storage);
    return listData;
  }

  const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
  const { db } = await import('../config/firebase');
  const docRef = await addDoc(collection(db, 'wordLists'), { ...listData, createdAt: serverTimestamp() });
  return { ...listData, id: docRef.id };
}

export async function getWordLists(teacherId = null) {
  if (DEMO_MODE) {
    const storage = getDemoStorage();
    const lists = storage.wordLists || [];
    if (teacherId) {
      return lists.filter((l) => l.teacherId === teacherId);
    }
    return lists;
  }

  const { collection, getDocs, query, where, orderBy } = await import('firebase/firestore');
  const { db } = await import('../config/firebase');

  let q;
  if (teacherId) {
    q = query(
      collection(db, 'wordLists'),
      where('teacherId', '==', teacherId),
      orderBy('createdAt', 'desc')
    );
  } else {
    q = query(collection(db, 'wordLists'), orderBy('createdAt', 'desc'));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getWordList(listId) {
  if (DEMO_MODE) {
    const storage = getDemoStorage();
    const list = (storage.wordLists || []).find((l) => l.id === listId);
    if (!list) throw new Error('Word list not found');
    return list;
  }

  const { doc, getDoc } = await import('firebase/firestore');
  const { db } = await import('../config/firebase');
  const docRef = doc(db, 'wordLists', listId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error('Word list not found');
  }

  return { id: docSnap.id, ...docSnap.data() };
}

export async function updateWordList(listId, updates) {
  if (DEMO_MODE) {
    const storage = getDemoStorage();
    const index = (storage.wordLists || []).findIndex((l) => l.id === listId);
    if (index !== -1) {
      storage.wordLists[index] = { ...storage.wordLists[index], ...updates };
      setDemoStorage(storage);
    }
    return;
  }

  const { doc, updateDoc } = await import('firebase/firestore');
  const { db } = await import('../config/firebase');
  const docRef = doc(db, 'wordLists', listId);
  await updateDoc(docRef, updates);
}

export async function deleteWordList(listId) {
  if (DEMO_MODE) {
    const storage = getDemoStorage();
    storage.wordLists = (storage.wordLists || []).filter((l) => l.id !== listId);
    setDemoStorage(storage);
    return;
  }

  const { doc, deleteDoc } = await import('firebase/firestore');
  const { db } = await import('../config/firebase');
  const docRef = doc(db, 'wordLists', listId);
  await deleteDoc(docRef);
}

// ==================== Text Units ====================

export async function createTextUnit(teacherId, title, text, words) {
  const unitData = {
    id: 'text_' + Date.now(),
    teacherId,
    title,
    text,
    words: words.map((word, index) => ({
      id: word.id || `tw_${Date.now()}_${index}`,
      en: word.en,
      he: word.he,
      sentenceInText: word.sentenceInText || '',
    })),
    createdAt: new Date().toISOString(),
  };

  if (DEMO_MODE) {
    const storage = getDemoStorage();
    storage.textUnits = storage.textUnits || [];
    storage.textUnits.unshift(unitData);
    setDemoStorage(storage);
    return unitData;
  }

  const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
  const { db } = await import('../config/firebase');
  const docRef = await addDoc(collection(db, 'textUnits'), { ...unitData, createdAt: serverTimestamp() });
  return { ...unitData, id: docRef.id };
}

export async function getTextUnits(teacherId = null) {
  if (DEMO_MODE) {
    const storage = getDemoStorage();
    const units = storage.textUnits || [];
    if (teacherId) {
      return units.filter((u) => u.teacherId === teacherId);
    }
    return units;
  }

  const { collection, getDocs, query, where, orderBy } = await import('firebase/firestore');
  const { db } = await import('../config/firebase');

  let q;
  if (teacherId) {
    q = query(
      collection(db, 'textUnits'),
      where('teacherId', '==', teacherId),
      orderBy('createdAt', 'desc')
    );
  } else {
    q = query(collection(db, 'textUnits'), orderBy('createdAt', 'desc'));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getTextUnit(unitId) {
  if (DEMO_MODE) {
    const storage = getDemoStorage();
    const unit = (storage.textUnits || []).find((u) => u.id === unitId);
    if (!unit) throw new Error('Text unit not found');
    return unit;
  }

  const { doc, getDoc } = await import('firebase/firestore');
  const { db } = await import('../config/firebase');
  const docRef = doc(db, 'textUnits', unitId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error('Text unit not found');
  }

  return { id: docSnap.id, ...docSnap.data() };
}

export async function updateTextUnit(unitId, updates) {
  if (DEMO_MODE) {
    const storage = getDemoStorage();
    const index = (storage.textUnits || []).findIndex((u) => u.id === unitId);
    if (index !== -1) {
      storage.textUnits[index] = { ...storage.textUnits[index], ...updates };
      setDemoStorage(storage);
    }
    return;
  }

  const { doc, updateDoc } = await import('firebase/firestore');
  const { db } = await import('../config/firebase');
  const docRef = doc(db, 'textUnits', unitId);
  await updateDoc(docRef, updates);
}

export async function deleteTextUnit(unitId) {
  if (DEMO_MODE) {
    const storage = getDemoStorage();
    storage.textUnits = (storage.textUnits || []).filter((u) => u.id !== unitId);
    setDemoStorage(storage);
    return;
  }

  const { doc, deleteDoc } = await import('firebase/firestore');
  const { db } = await import('../config/firebase');
  const docRef = doc(db, 'textUnits', unitId);
  await deleteDoc(docRef);
}

// ==================== Progress Tracking ====================

export async function getProgress(uid, listId = null) {
  if (DEMO_MODE) {
    const storage = getDemoStorage();
    let progress = storage.progress || [];
    progress = progress.filter((p) => p.uid === uid);
    if (listId) {
      progress = progress.filter((p) => p.listId === listId);
    }
    return progress;
  }

  const { collection, getDocs, query, where } = await import('firebase/firestore');
  const { db } = await import('../config/firebase');

  let q;
  if (listId) {
    q = query(
      collection(db, 'progress'),
      where('uid', '==', uid),
      where('listId', '==', listId)
    );
  } else {
    q = query(collection(db, 'progress'), where('uid', '==', uid));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function updateProgress(uid, wordId, listId, isCorrect) {
  if (DEMO_MODE) {
    const storage = getDemoStorage();
    storage.progress = storage.progress || [];

    const index = storage.progress.findIndex(
      (p) => p.uid === uid && p.wordId === wordId && p.listId === listId
    );

    if (index === -1) {
      // Create new progress
      const now = new Date();
      const nextReview = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      storage.progress.push({
        id: 'progress_' + Date.now(),
        uid,
        wordId,
        listId,
        repetitions: 1,
        correctCount: isCorrect ? 1 : 0,
        wrongCount: isCorrect ? 0 : 1,
        lastSeen: now.toISOString(),
        nextReview: nextReview.toISOString(),
        interval: 1,
      });
    } else {
      // Update existing
      const p = storage.progress[index];
      const newCorrect = p.correctCount + (isCorrect ? 1 : 0);
      const newWrong = p.wrongCount + (isCorrect ? 0 : 1);

      let newInterval, newRepetitions;
      if (isCorrect) {
        newRepetitions = p.repetitions + 1;
        const intervals = [1, 3, 7, 14, 30];
        newInterval = intervals[Math.min(newRepetitions - 1, intervals.length - 1)];
      } else {
        newRepetitions = 0;
        newInterval = 1;
      }

      const nextReview = new Date(Date.now() + newInterval * 24 * 60 * 60 * 1000);

      storage.progress[index] = {
        ...p,
        repetitions: newRepetitions,
        correctCount: newCorrect,
        wrongCount: newWrong,
        lastSeen: new Date().toISOString(),
        nextReview: nextReview.toISOString(),
        interval: newInterval,
      };
    }

    setDemoStorage(storage);
    return;
  }

  // Firebase implementation
  const { collection, getDocs, query, where, addDoc, updateDoc, doc, serverTimestamp } = await import('firebase/firestore');
  const { db } = await import('../config/firebase');

  const progressQuery = query(
    collection(db, 'progress'),
    where('uid', '==', uid),
    where('wordId', '==', wordId),
    where('listId', '==', listId)
  );

  const snapshot = await getDocs(progressQuery);

  if (snapshot.empty) {
    const now = new Date();
    const nextReview = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    await addDoc(collection(db, 'progress'), {
      uid,
      wordId,
      listId,
      repetitions: 1,
      correctCount: isCorrect ? 1 : 0,
      wrongCount: isCorrect ? 0 : 1,
      lastSeen: serverTimestamp(),
      nextReview: nextReview,
      interval: 1,
    });
  } else {
    const progressDoc = snapshot.docs[0];
    const data = progressDoc.data();

    const newCorrect = data.correctCount + (isCorrect ? 1 : 0);
    const newWrong = data.wrongCount + (isCorrect ? 0 : 1);

    let newInterval, newRepetitions;
    if (isCorrect) {
      newRepetitions = data.repetitions + 1;
      const intervals = [1, 3, 7, 14, 30];
      newInterval = intervals[Math.min(newRepetitions - 1, intervals.length - 1)];
    } else {
      newRepetitions = 0;
      newInterval = 1;
    }

    const nextReview = new Date(Date.now() + newInterval * 24 * 60 * 60 * 1000);

    await updateDoc(doc(db, 'progress', progressDoc.id), {
      repetitions: newRepetitions,
      correctCount: newCorrect,
      wrongCount: newWrong,
      lastSeen: serverTimestamp(),
      nextReview: nextReview,
      interval: newInterval,
    });
  }
}

export async function getWordsDueForReview(uid, listId = null) {
  const progress = await getProgress(uid, listId);
  const now = new Date();

  return progress.filter((p) => {
    if (!p.nextReview) return true;
    const reviewDate = typeof p.nextReview === 'string'
      ? new Date(p.nextReview)
      : p.nextReview.toDate ? p.nextReview.toDate() : new Date(p.nextReview);
    return reviewDate <= now;
  });
}

// ==================== Student Progress (for Teachers) ====================

export async function getStudentsProgress(teacherWordListIds) {
  if (!teacherWordListIds.length) return [];

  if (DEMO_MODE) {
    const storage = getDemoStorage();
    return (storage.progress || []).filter((p) =>
      teacherWordListIds.includes(p.listId)
    );
  }

  const { collection, getDocs, query, where } = await import('firebase/firestore');
  const { db } = await import('../config/firebase');

  const progressData = [];
  for (const listId of teacherWordListIds) {
    const q = query(collection(db, 'progress'), where('listId', '==', listId));
    const snapshot = await getDocs(q);
    snapshot.docs.forEach((doc) => {
      progressData.push({ id: doc.id, ...doc.data() });
    });
  }

  return progressData;
}

export async function getStrugglingWordsAnalytics(teacherWordListIds) {
  const progress = await getStudentsProgress(teacherWordListIds);

  const wordStats = {};
  progress.forEach((p) => {
    if (!wordStats[p.wordId]) {
      wordStats[p.wordId] = {
        wordId: p.wordId,
        listId: p.listId,
        totalAttempts: 0,
        totalCorrect: 0,
        totalWrong: 0,
        studentCount: 0,
      };
    }

    wordStats[p.wordId].totalAttempts += p.correctCount + p.wrongCount;
    wordStats[p.wordId].totalCorrect += p.correctCount;
    wordStats[p.wordId].totalWrong += p.wrongCount;
    wordStats[p.wordId].studentCount += 1;
  });

  const words = Object.values(wordStats)
    .map((w) => ({
      ...w,
      successRate: w.totalAttempts > 0 ? w.totalCorrect / w.totalAttempts : 0,
    }))
    .filter((w) => w.totalAttempts >= 5)
    .sort((a, b) => a.successRate - b.successRate);

  return words;
}

// ==================== User Operations ====================

export async function getAllStudents() {
  if (DEMO_MODE) {
    const storage = getDemoStorage();
    return Object.entries(storage.users || {})
      .filter(([, user]) => user.role === 'student')
      .map(([id, user]) => ({ id, ...user }));
  }

  const { collection, getDocs, query, where } = await import('firebase/firestore');
  const { db } = await import('../config/firebase');

  const q = query(collection(db, 'users'), where('role', '==', 'student'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getStudentById(studentId) {
  if (DEMO_MODE) {
    const storage = getDemoStorage();
    const student = storage.users?.[studentId];
    if (!student) throw new Error('Student not found');
    return { id: studentId, ...student };
  }

  const { doc, getDoc } = await import('firebase/firestore');
  const { db } = await import('../config/firebase');

  const docRef = doc(db, 'users', studentId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error('Student not found');
  }

  return { id: docSnap.id, ...docSnap.data() };
}
