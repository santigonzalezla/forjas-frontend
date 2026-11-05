// Error con el código HTTP para que las páginas decidan (404 → notFound, etc.)
export class HttpError extends Error
{
    constructor(
        public readonly status: number,
        message: string,
    )
    {
        super(message);
        this.name = 'HttpError';
    }
}
