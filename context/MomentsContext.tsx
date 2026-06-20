import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface MomentLocation {
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
  country?: string;
}

export interface Moment {
  id: string;
  photoUri: string;
  timestamp: number;
  location?: MomentLocation;
  caption?: string;
}

export interface Photobook {
  id: string;
  title: string;
  momentIds: string[];
  createdAt: number;
  coverMomentId?: string;
}

interface MomentsContextType {
  moments: Moment[];
  books: Photobook[];
  addMoment: (moment: Omit<Moment, "id">) => Promise<Moment>;
  updateMoment: (id: string, updates: Partial<Moment>) => Promise<void>;
  deleteMoment: (id: string) => Promise<void>;
  createBook: (title: string, momentIds: string[]) => Promise<Photobook>;
  deleteBook: (id: string) => Promise<void>;
  addMomentsToBook: (bookId: string, momentIds: string[]) => Promise<void>;
  isLoading: boolean;
}

const MomentsContext = createContext<
  MomentsContextType | undefined
>(undefined);

const MOMENTS_KEY = "@life_moments_data";
const BOOKS_KEY = "@life_books_data";

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function MomentsProvider({ children }: { children: React.ReactNode }) {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [books, setBooks] = useState<Photobook[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [momentsRaw, booksRaw] = await Promise.all([
          AsyncStorage.getItem(MOMENTS_KEY),
          AsyncStorage.getItem(BOOKS_KEY),
        ]);
        if (momentsRaw) setMoments(JSON.parse(momentsRaw));
        if (booksRaw) setBooks(JSON.parse(booksRaw));
      } catch (e) {
        // ignore
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const saveMoments = useCallback(async (updated: Moment[]) => {
    setMoments(updated);
    await AsyncStorage.setItem(MOMENTS_KEY, JSON.stringify(updated));
  }, []);

  const saveBooks = useCallback(async (updated: Photobook[]) => {
    setBooks(updated);
    await AsyncStorage.setItem(BOOKS_KEY, JSON.stringify(updated));
  }, []);

  const addMoment = useCallback(
    async (data: Omit<Moment, "id">): Promise<Moment> => {
      const moment: Moment = { ...data, id: generateId() };
      const updated = [moment, ...moments];
      await saveMoments(updated);
      return moment;
    },
    [moments, saveMoments]
  );

  const updateMoment = useCallback(
    async (id: string, updates: Partial<Moment>) => {
      const updated = moments.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      );
      await saveMoments(updated);
    },
    [moments, saveMoments]
  );

  const deleteMoment = useCallback(
    async (id: string) => {
      const updated = moments.filter((m) => m.id !== id);
      await saveMoments(updated);
      const updatedBooks = books.map((b) => ({
        ...b,
        momentIds: b.momentIds.filter((mid) => mid !== id),
        coverMomentId: b.coverMomentId === id ? undefined : b.coverMomentId,
      }));
      await saveBooks(updatedBooks);
    },
    [moments, books, saveMoments, saveBooks]
  );

  const createBook = useCallback(
    async (title: string, momentIds: string[]): Promise<Photobook> => {
      const book: Photobook = {
        id: generateId(),
        title,
        momentIds,
        createdAt: Date.now(),
        coverMomentId: momentIds[0],
      };
      const updated = [book, ...books];
      await saveBooks(updated);
      return book;
    },
    [books, saveBooks]
  );

  const deleteBook = useCallback(
    async (id: string) => {
      await saveBooks(books.filter((b) => b.id !== id));
    },
    [books, saveBooks]
  );

  const addMomentsToBook = useCallback(
    async (bookId: string, momentIds: string[]) => {
      const updated = books.map((b) => {
        if (b.id !== bookId) return b;
        const combined = Array.from(new Set([...b.momentIds, ...momentIds]));
        return { ...b, momentIds: combined };
      });
      await saveBooks(updated);
    },
    [books, saveBooks]
  );

  return (
    <MomentsContext.Provider
      value={{
        moments,
        books,
        addMoment,
        updateMoment,
        deleteMoment,
        createBook,
        deleteBook,
        addMomentsToBook,
        isLoading,
      }}
    >
      {children}
    </MomentsContext.Provider>
  );
}

export function useMoments() {
  const ctx = useContext(MomentsContext);

  if (ctx === undefined) {
    throw new Error(
      "useMoments must be used within MomentsProvider"
    );
  }

  return ctx;
}
