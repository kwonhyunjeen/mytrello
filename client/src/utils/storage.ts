import { useSyncExternalStore } from 'react';
import { Board, BoardUUID, Card, CardUUID, List, ListUUID } from 'store';

export type KanbanStorageUnit = {
  getAll: (...args: any[]) => unknown;
  getOrders: (...args: any[]) => unknown;
  create: (...args: any[]) => unknown;
  delete: (...args: any[]) => unknown;
  reorder: (...args: any[]) => unknown;
};

export type KanbanBoardStorage = {
  getAll: () => Board[];
  getOrders: () => BoardUUID[];
  create: (board: Board) => void;
  delete: (boardId: BoardUUID) => void;
  reorder: (boardIds: BoardUUID[]) => void;
};

export type KanbanListStorage = {
  getAll: (boardId: BoardUUID) => List[];
  getOrders: (boardId: BoardUUID) => ListUUID[];
  create: (boardId: BoardUUID, list: List) => void;
  delete: (boardId: BoardUUID, listId: ListUUID) => void;
  reorder: (boardId: BoardUUID, listIds: ListUUID[]) => void;
};

export type KanbanCardStorage = {
  getAll: (listId: ListUUID) => Card[];
  getOrders: (listId: ListUUID) => CardUUID[];
  create: (listId: ListUUID, card: Card) => void;
  delete: (listId: ListUUID, cardId: CardUUID) => void;
  reorder: (listId: ListUUID, cardIds: CardUUID[]) => void;
};

export type KanbanStorage = {
  board: KanbanBoardStorage;
  list: KanbanListStorage;
  card: KanbanCardStorage;
};

export type KanbanExternalStore<T extends KanbanStorageUnit> = {
  subscribe: Parameters<typeof useSyncExternalStore<unknown>>[0];
  getSnapshot: () => { getAll: T['getAll']; getOrders: T['getOrders'] };
  create: (...args: Parameters<T['create']>) => ReturnType<T['create']>;
  delete: (...args: Parameters<T['delete']>) => ReturnType<T['delete']>;
  reorder: (...args: Parameters<T['reorder']>) => ReturnType<T['reorder']>;
};

export const makeKanbanExternalStore = <T extends KanbanStorageUnit>(
  storageUnit: T
): KanbanExternalStore<T> => {
  let snapshot = { getAll: storageUnit.getAll, getOrders: storageUnit.getOrders };
  let listeners: Array<() => void> = [];
  const emitChange = () => {
    snapshot = { getAll: storageUnit.getAll, getOrders: storageUnit.getOrders };
    for (let listener of listeners) {
      listener();
    }
  };
  return {
    subscribe(listener: () => void) {
      listeners = [...listeners, listener];
      return () => {
        listeners = listeners.filter(it => it !== listener);
      };
    },
    getSnapshot() {
      return snapshot;
    },
    create(...args: unknown[]) {
      storageUnit.create(...args);
      emitChange();
    },
    delete(...args: unknown[]) {
      storageUnit.delete(...args);
      emitChange();
    },
    reorder(...args: unknown[]) {
      storageUnit.reorder(...args);
      emitChange();
    }
  } as unknown as KanbanExternalStore<T>;
};