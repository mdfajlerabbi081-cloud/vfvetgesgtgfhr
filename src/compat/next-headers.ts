export interface CookieItem {
  name: string;
  value: string;
}

export interface ReadonlyRequestCookies {
  get(name: string): CookieItem | undefined;
  has(name: string): boolean;
}

export function cookies(): ReadonlyRequestCookies & Promise<ReadonlyRequestCookies> {
  const store: ReadonlyRequestCookies = {
    get(_name: string) {
      return undefined;
    },
    has(_name: string) {
      return false;
    },
  };
  const promise = Promise.resolve(store) as ReadonlyRequestCookies &
    Promise<ReadonlyRequestCookies>;
  promise.get = store.get;
  promise.has = store.has;
  return promise;
}
