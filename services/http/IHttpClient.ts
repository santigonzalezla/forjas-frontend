// Contrato del cliente HTTP. Los servicios dependen de esta interfaz y no de fetch,
// así se pueden probar con un doble y cambiar la implementación sin tocarlos.
export interface RequestOptions
{
    headers?:   Record<string, string>;
    timeoutMs?: number;
}

export interface IHttpClient
{
    get<T>(path: string, options?: RequestOptions): Promise<T>;
    post<T>(path: string, body: unknown, options?: RequestOptions): Promise<T>;
    patch<T>(path: string, body: unknown, options?: RequestOptions): Promise<T>;
    delete<T>(path: string, options?: RequestOptions): Promise<T>;
}
