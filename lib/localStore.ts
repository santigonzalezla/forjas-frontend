
type Listener = () => void;

export interface LocalStore<T>
{
    subscribe:         (listener: Listener) => () => void;
    getSnapshot:       () => T;
    getServerSnapshot: () => T;
    set:               (value: T) => void;
    clear:             () => void;
}

export function createLocalStore<T>(key: string, fallback: T): LocalStore<T>
{
    const listeners = new Set<Listener>();

    let cachedRaw: string | null = null;
    let cachedValue: T           = fallback;

    const read = (): T =>
    {
        let raw: string | null = null;

        try
        {
            raw = localStorage.getItem(key);
        }
        catch
        {
            return fallback;
        }

        if (raw === cachedRaw) return cachedValue;

        cachedRaw = raw;
        try
        {
            cachedValue = raw === null ? fallback : JSON.parse(raw) as T;
        }
        catch
        {
            cachedValue = fallback;
        }
        return cachedValue;
    };

    const emit = () => listeners.forEach(listener => listener());

    const onStorage = (event: StorageEvent) =>
    {
        if (event.key === key) emit();
    };

    return {
        subscribe(listener)
        {
            listeners.add(listener);
            if (listeners.size === 1) window.addEventListener('storage', onStorage);

            return () =>
            {
                listeners.delete(listener);
                if (listeners.size === 0) window.removeEventListener('storage', onStorage);
            };
        },
        getSnapshot:       read,
        getServerSnapshot: () => fallback,
        set(value)
        {
            try
            {
                localStorage.setItem(key, JSON.stringify(value));
            }
            catch
            {
            }
            emit();
        },
        clear()
        {
            try
            {
                localStorage.removeItem(key);
            }
            catch
            {
            }
            emit();
        },
    };
}

const noopSubscribe = () => () => {};
export const hydrationStore = {
    subscribe:         noopSubscribe,
    getSnapshot:       () => true,
    getServerSnapshot: () => false,
};
