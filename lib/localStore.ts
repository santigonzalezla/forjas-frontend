// Store mínimo sobre localStorage para usar con useSyncExternalStore.
// Evita el patrón "leer localStorage en un useEffect y hacer setState", que provoca
// renders en cascada y que React Compiler marca como error.

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

    // Se cachea por el texto crudo para devolver siempre la misma referencia
    // mientras el valor no cambie (requisito de useSyncExternalStore).
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
            return fallback; // almacenamiento bloqueado (modo privado, permisos)
        }

        if (raw === cachedRaw) return cachedValue;

        cachedRaw = raw;
        try
        {
            cachedValue = raw === null ? fallback : JSON.parse(raw) as T;
        }
        catch
        {
            cachedValue = fallback; // valor corrupto
        }
        return cachedValue;
    };

    const emit = () => listeners.forEach(listener => listener());

    const onStorage = (event: StorageEvent) =>
    {
        if (event.key === key) emit(); // cambios hechos desde otra pestaña
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
                // Sin almacenamiento el valor no persiste; igual se notifica
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
                // Nada que limpiar
            }
            emit();
        },
    };
}

// true en el cliente después de hidratar, false en el servidor
const noopSubscribe = () => () => {};
export const hydrationStore = {
    subscribe:         noopSubscribe,
    getSnapshot:       () => true,
    getServerSnapshot: () => false,
};
