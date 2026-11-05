import type {IHttpClient, RequestOptions} from '@/services/http/IHttpClient';
import {HttpError} from '@/services/http/HttpError';

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

const DEFAULT_TIMEOUT_MS = 10_000;

// Cliente HTTP del lado del servidor para hablar con el backend Nest.
// La caché la deciden las funciones de services/queries con 'use cache', no este cliente.
export class HttpClient implements IHttpClient
{
    constructor(private readonly baseUrl: string) {}

    get<T>(path: string, options?: RequestOptions): Promise<T>
    {
        return this.request<T>('GET', path, undefined, options);
    }

    post<T>(path: string, body: unknown, options?: RequestOptions): Promise<T>
    {
        return this.request<T>('POST', path, body, options);
    }

    patch<T>(path: string, body: unknown, options?: RequestOptions): Promise<T>
    {
        return this.request<T>('PATCH', path, body, options);
    }

    delete<T>(path: string, options?: RequestOptions): Promise<T>
    {
        return this.request<T>('DELETE', path, undefined, options);
    }

    private async request<T>(method: Method, path: string, body?: unknown, options: RequestOptions = {}): Promise<T>
    {
        const controller = new AbortController();
        const timer      = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

        try
        {
            const response = await fetch(`${this.baseUrl}/${path}`, {
                method,
                headers: {'Content-Type': 'application/json', ...options.headers},
                body:    body !== undefined ? JSON.stringify(body) : undefined,
                signal:  controller.signal,
            });

            if (!response.ok)
            {
                const errorData = await response.json().catch(() => ({}));
                // Nest devuelve message como string o como arreglo (errores de validación)
                const message   = Array.isArray(errorData.message)
                    ? errorData.message.join(', ')
                    : (errorData.message ?? `Error ${response.status}: ${response.statusText}`);

                throw new HttpError(response.status, message);
            }

            const text = await response.text();
            return (text.length > 0 ? JSON.parse(text) : null) as T;
        }
        catch (error)
        {
            if (error instanceof HttpError) throw error;
            if (error instanceof Error && error.name === 'AbortError')
                throw new HttpError(504, `Tiempo de espera agotado: ${method} ${path}`);

            throw new HttpError(503, 'No fue posible conectar con el servidor');
        }
        finally
        {
            clearTimeout(timer);
        }
    }
}
