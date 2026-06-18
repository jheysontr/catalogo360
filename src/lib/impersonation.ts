// Admin "manage as owner" impersonation helpers.
// When an admin clicks "Administrar tienda" from the admin panel,
// we store the target store + owner in sessionStorage. Dashboard pages
// then load data for that store instead of the admin's own.

const STORE_KEY = "admin_impersonate_store_id";
const USER_KEY = "admin_impersonate_user_id";
const NAME_KEY = "admin_impersonate_store_name";

export interface ImpersonationState {
  storeId: string;
  userId: string;
  storeName: string;
}

export function setImpersonation(state: ImpersonationState) {
  try {
    sessionStorage.setItem(STORE_KEY, state.storeId);
    sessionStorage.setItem(USER_KEY, state.userId);
    sessionStorage.setItem(NAME_KEY, state.storeName);
  } catch {
    /* ignore */
  }
}

export function getImpersonation(): ImpersonationState | null {
  try {
    const storeId = sessionStorage.getItem(STORE_KEY);
    const userId = sessionStorage.getItem(USER_KEY);
    const storeName = sessionStorage.getItem(NAME_KEY);
    if (!storeId || !userId) return null;
    return { storeId, userId, storeName: storeName || "" };
  } catch {
    return null;
  }
}

export function clearImpersonation() {
  try {
    sessionStorage.removeItem(STORE_KEY);
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(NAME_KEY);
  } catch {
    /* ignore */
  }
}

/** Returns the user_id to filter "stores" queries by — the impersonated owner if set, else the real user. */
export function effectiveUserId(realUserId: string | undefined): string | undefined {
  return getImpersonation()?.userId || realUserId;
}
