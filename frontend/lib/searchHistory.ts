export type SearchMode = 'coach' | 'drill' | 'correction' | 'oral' | 'culture' | 'auto';

export interface SearchHistoryEntry {
  id: string;
  query: string;
  answer: string;
  mode: SearchMode;
  createdAt: string;
}

const STORAGE_KEY = 'spanish-grammar-agent.search-history';
const MAX_HISTORY_ITEMS = 50;
const SEARCH_HISTORY_EVENT = 'search-history-updated';

function isValidMode(mode: unknown): mode is SearchMode {
  return mode === 'coach' || mode === 'drill' || mode === 'correction' ||
    mode === 'oral' || mode === 'culture' || mode === 'auto';
}

function isSearchHistoryEntry(value: unknown): value is SearchHistoryEntry {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === 'string' &&
    typeof entry.query === 'string' &&
    typeof entry.answer === 'string' &&
    typeof entry.createdAt === 'string' &&
    isValidMode(entry.mode)
  );
}

export function getSearchHistory(): SearchHistoryEntry[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isSearchHistoryEntry);
  } catch (error) {
    console.error('读取搜索记录失败:', error);
    return [];
  }
}

export function saveSearchHistory(entry: Omit<SearchHistoryEntry, 'id'>): SearchHistoryEntry[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const nextEntry: SearchHistoryEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  };

  const nextHistory = [nextEntry, ...getSearchHistory()].slice(0, MAX_HISTORY_ITEMS);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory));
  window.dispatchEvent(new Event(SEARCH_HISTORY_EVENT));
  return nextHistory;
}

export function clearSearchHistory() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(SEARCH_HISTORY_EVENT));
}

export function getModeLabel(mode: SearchMode) {
  switch (mode) {
    case 'coach':
      return '学习规划';
    case 'drill':
      return '出题';
    case 'correction':
      return '错题解析';
    case 'oral':
      return '口语';
    case 'culture':
      return '文化';
    case 'auto':
    default:
      return '自动';
  }
}

export function subscribeSearchHistory(onStoreChange: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleCustomUpdate = () => {
    onStoreChange();
  };

  const handleStorage = (event: StorageEvent) => {
    if (!event.key || event.key === STORAGE_KEY) {
      onStoreChange();
    }
  };

  window.addEventListener(SEARCH_HISTORY_EVENT, handleCustomUpdate);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(SEARCH_HISTORY_EVENT, handleCustomUpdate);
    window.removeEventListener('storage', handleStorage);
  };
}
