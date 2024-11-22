import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "func-cache";
const STORE_NAME = "func";

const getDB = (() => {
  let db: IDBPDatabase;
  return async () => {
    db = await openDB(DB_NAME, 1, {
      upgrade(database) {
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME);
        }
      },
    });
    return db;
  };
})();

export const withCache = <P extends any[], R extends any>(
  fn: (...args: P) => Promise<R>,
  key: string,
  config: { expires: number }
) => {
  const runner = async (...args: P) => {
    const db = await getDB();
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);

    const cached = (await store.get(key)) as { updated: number; result: any };
    await transaction.done;
    if (cached && Date.now() - cached.updated <= config.expires) {
      return cached.result as R;
    }
    const result = await fn(...args);
    const transaction2 = db.transaction(STORE_NAME, "readwrite");
    const store2 = transaction2.objectStore(STORE_NAME);
    await store2.put({ updated: Date.now(), result }, key);
    await transaction2.done;
    return result;
  };
  return runner;
};
