// Script en línea que corre antes del primer pintado (p. ej. aplicar el tema).
// Patrón de la guía de Next 16 "preventing-flash-before-hydration": en el servidor
// sale como text/javascript (se ejecuta al parsear el HTML) y en el cliente como
// text/plain, así React no advierte que está renderizando un <script>.
const InlineScript = ({html}: {html: string}) =>
{
    return (
        <script
            type={typeof window === 'undefined' ? 'text/javascript' : 'text/plain'}
            suppressHydrationWarning
            dangerouslySetInnerHTML={{__html: html}}
        />
    );
};

export default InlineScript;
