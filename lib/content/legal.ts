import {ADDRESS, CONTACT_EMAIL, PHONE_LANDLINE, WHATSAPP_DISPLAY} from '@/lib/constants';

// BORRADOR de textos legales basados en la normativa colombiana citada en cada
// documento. Deben ser revisados por un abogado antes de publicar el sitio.
// Los datos entre corchetes los debe confirmar el cliente (no se inventan).

export const LEGAL_ENTITY = {
    name:      'Forjas · Hierro Hecho Arte',
    legalName: '[Razón social por confirmar]',
    taxId:     '[NIT por confirmar]',
    address:   ADDRESS,
    email:     CONTACT_EMAIL,
    whatsapp:  WHATSAPP_DISPLAY,
    phone:     PHONE_LANDLINE,
};

export const LEGAL_UPDATED = '5 de noviembre de 2026';

export type LegalBlock = string | {list: string[]};

export interface LegalSection
{
    id:      string;
    heading: string;
    blocks:  LegalBlock[];
}

export interface LegalDocumentContent
{
    title:    string;
    intro:    string;
    sections: LegalSection[];
}

const E = LEGAL_ENTITY;

const CONTACT_LINE = `Correo ${E.email}, WhatsApp ${E.whatsapp}, teléfono ${E.phone}, o en el taller: ${E.address}.`;

// ─── Política de tratamiento de datos personales ─────────────────────────────

export const PRIVACY: LegalDocumentContent = {
    title: 'Política de tratamiento de datos personales',
    intro: 'Así recogemos, usamos y protegemos los datos que nos compartes en esta página, en cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013 (compilado en el Decreto 1074 de 2015).',
    sections: [
        {
            id:      'responsable',
            heading: 'Responsable del tratamiento',
            blocks:  [`${E.name} (${E.legalName}, ${E.taxId}), con domicilio en ${E.address}. ${CONTACT_LINE}`],
        },
        {
            id:      'datos',
            heading: 'Qué datos recogemos',
            blocks:  [
                'Solo los que nos das al escribirnos, cotizar, diseñar una pieza o comprar:',
                {list: [
                    'Nombre, celular o WhatsApp, correo y ciudad.',
                    'El mensaje, las medidas, el diseño del configurador 3D y las fotos que adjuntes.',
                    'Los datos de entrega y facturación cuando haces un pedido.',
                ]},
                'No pedimos datos sensibles ni datos de niñas, niños o adolescentes. Si una foto muestra personas, te pedimos que la recortes o la tomes sin ellas.',
                'La página guarda en tu navegador el contenido del carrito y el tema claro u oscuro que elijas. Esa información no sale de tu dispositivo.',
            ],
        },
        {
            id:      'finalidades',
            heading: 'Para qué los usamos',
            blocks:  [
                {list: [
                    'Responder tus mensajes y solicitudes.',
                    'Preparar cotizaciones y agendar visitas técnicas.',
                    'Fabricar, entregar e instalar tus pedidos, facturarlos y atender garantías.',
                    'Enviarte información de productos o promociones, solo si nos autorizas expresamente para eso.',
                ]},
                'No vendemos ni alquilamos tus datos.',
            ],
        },
        {
            id:      'autorizacion',
            heading: 'Autorización',
            blocks:  [
                'Antes de enviar cualquier formulario te pedimos autorizar el tratamiento de tus datos marcando la casilla correspondiente. Guardamos la fecha y hora de esa autorización como prueba.',
                'Si nos escribes directamente por WhatsApp, también aplican las condiciones de ese servicio, que es operado por un tercero.',
            ],
        },
        {
            id:      'encargados',
            heading: 'Quién más puede tratarlos',
            blocks:  [
                'Usamos proveedores de alojamiento web y de almacenamiento de archivos en la nube para que la página funcione. Algunos de ellos operan servidores fuera de Colombia. Solo acceden a los datos para prestarnos ese servicio y bajo condiciones de seguridad y confidencialidad.',
                'También compartimos los datos necesarios con la transportadora o la pasarela de pago cuando haces un pedido.',
            ],
        },
        {
            id:      'derechos',
            heading: 'Tus derechos',
            blocks:  [
                'Como titular de los datos tienes derecho a (artículo 8 de la Ley 1581 de 2012):',
                {list: [
                    'Conocer, actualizar y rectificar tus datos.',
                    'Pedir prueba de la autorización que nos diste.',
                    'Saber qué uso les hemos dado.',
                    'Revocar la autorización o pedir que los eliminemos, cuando no exista un deber legal o contractual de conservarlos.',
                    'Acceder a ellos de forma gratuita.',
                    'Presentar quejas ante la Superintendencia de Industria y Comercio, después de haber agotado el trámite con nosotros.',
                ]},
            ],
        },
        {
            id:      'procedimiento',
            heading: 'Cómo ejercerlos',
            blocks:  [
                `Escríbenos indicando tu nombre, el dato o la solicitud y un medio para responderte. ${CONTACT_LINE}`,
                {list: [
                    'Consultas: respondemos en máximo diez (10) días hábiles. Si no es posible, te avisamos el motivo y respondemos dentro de los cinco (5) días hábiles siguientes.',
                    'Reclamos (corrección, actualización, supresión o revocatoria): respondemos en máximo quince (15) días hábiles, prorrogables hasta por ocho (8) días hábiles más, avisándote el motivo.',
                ]},
            ],
        },
        {
            id:      'seguridad',
            heading: 'Seguridad y conservación',
            blocks:  [
                'Protegemos los datos con medidas técnicas y administrativas razonables: conexión cifrada y acceso restringido al panel interno.',
                'Los conservamos mientras sean necesarios para las finalidades descritas y para cumplir obligaciones legales, contables y de garantía.',
            ],
        },
        {
            id:      'vigencia',
            heading: 'Vigencia y cambios',
            blocks:  ['Esta política rige desde su publicación. Si la cambiamos de forma sustancial, lo avisaremos en esta página.'],
        },
    ],
};

// ─── Términos y condiciones ──────────────────────────────────────────────────

export const TERMS: LegalDocumentContent = {
    title: 'Términos y condiciones',
    intro: 'Condiciones para usar esta página, comprar piezas de la tienda y solicitar trabajos a medida, conforme al Estatuto del Consumidor (Ley 1480 de 2011) y a la Ley 527 de 1999 sobre comercio electrónico.',
    sections: [
        {
            id:      'vendedor',
            heading: 'Quiénes somos',
            blocks:  [`${E.name} (${E.legalName}, ${E.taxId}), taller de ornamentación y muebles en hierro con domicilio en ${E.address}. ${CONTACT_LINE}`],
        },
        {
            id:      'productos',
            heading: 'Piezas de la tienda y piezas a medida',
            blocks:  [
                {list: [
                    'Piezas de catálogo: tienen precio publicado y se pueden pedir directamente.',
                    'Piezas configurables y a medida (portones, rejas, barandas, puertas y otras): se fabrican según las medidas y el diseño que acordamos contigo, a partir de una cotización.',
                ]},
                'Cada pieza se forja a mano. Puede haber pequeñas diferencias de textura, tono y acabado frente a las fotos, propias del trabajo artesanal; no se consideran defectos.',
            ],
        },
        {
            id:      'precios',
            heading: 'Precios',
            blocks:  [
                'Los precios se muestran en pesos colombianos e incluyen los impuestos aplicables. El valor del envío o de la instalación se informa antes de confirmar el pedido.',
                'El precio que muestra el configurador 3D es un estimado de referencia, no una oferta. El valor final se confirma por escrito en la cotización, después de verificar medidas y condiciones del sitio, normalmente en una visita técnica.',
            ],
        },
        {
            id:      'pedidos',
            heading: 'Pedidos y pagos',
            blocks:  [
                'El pedido queda confirmado cuando recibimos el pago, o el anticipo acordado en el caso de piezas a medida.',
                'Las condiciones de pago de las piezas a medida (anticipo, saldo y fechas) se pactan por escrito en cada cotización.',
                'Aceptamos los medios de pago disponibles en la página o los que te indiquemos al confirmar el pedido.',
            ],
        },
        {
            id:      'entregas',
            heading: 'Fabricación, entrega e instalación',
            blocks:  [
                'Los tiempos de fabricación se informan en cada producto o cotización y se cuentan desde la confirmación del pedido. Son estimados y pueden variar por causas ajenas a nosotros; si eso pasa, te avisamos.',
                'Instalamos en Valledupar y alrededores. Enviamos al resto del país con transportadora. Al recibir, revisa la pieza y avísanos de inmediato si llega con algún daño.',
            ],
        },
        {
            id:      'garantia',
            heading: 'Garantía, retracto y devoluciones',
            blocks:  ['Las condiciones de garantía, derecho de retracto y reversión del pago están en la página de cambios y garantías, que hace parte de estos términos.'],
        },
        {
            id:      'propiedad',
            heading: 'Propiedad intelectual',
            blocks:  ['Las fotos, textos, diseños y el logo de Forjas son de su propiedad. No pueden usarse con fines comerciales sin autorización escrita. Los diseños que crees en el configurador son para tu uso personal y para cotizar con nosotros.'],
        },
        {
            id:      'ley',
            heading: 'Ley aplicable',
            blocks:  ['Estos términos se rigen por las leyes de la República de Colombia. Si tienes una queja, escríbenos primero; también puedes acudir a la Superintendencia de Industria y Comercio.'],
        },
    ],
};

// ─── Cambios, devoluciones y garantías ───────────────────────────────────────

export const RETURNS: LegalDocumentContent = {
    title: 'Cambios, devoluciones y garantías',
    intro: 'Tus derechos al comprar en Forjas, según el Estatuto del Consumidor (Ley 1480 de 2011) y el Decreto 735 de 2013.',
    sections: [
        {
            id:      'retracto',
            heading: 'Derecho de retracto',
            blocks:  [
                'Si compraste una pieza de catálogo por esta página o a distancia, puedes retractarte dentro de los cinco (5) días hábiles siguientes a la entrega (artículo 47 de la Ley 1480 de 2011).',
                {list: [
                    'La pieza debe estar sin uso, completa y en el mismo estado en que la recibiste.',
                    'Los costos de transporte de la devolución corren por tu cuenta.',
                    'Te devolvemos el dinero en un plazo máximo de treinta (30) días calendario desde que ejerces el derecho.',
                ]},
                'El retracto no aplica a piezas fabricadas según tus medidas o especificaciones, ni a las diseñadas en el configurador 3D, porque son bienes personalizados (artículo 47, numeral 2).',
            ],
        },
        {
            id:      'reversion',
            heading: 'Reversión del pago',
            blocks:  [
                'Si pagaste con un medio electrónico (tarjeta, PSE u otro) puedes pedir la reversión del pago cuando fuiste víctima de fraude, la operación no fue solicitada, no recibiste la pieza, o la pieza no corresponde a lo pedido o tiene un defecto (artículo 51 de la Ley 1480 de 2011).',
                'Debes presentar la solicitud dentro de los cinco (5) días hábiles siguientes a la fecha en que conociste la situación, ante nosotros y ante el emisor del medio de pago, y devolver la pieza cuando corresponda.',
            ],
        },
        {
            id:      'garantia',
            heading: 'Garantía legal',
            blocks:  [
                'Todas nuestras piezas y trabajos tienen garantía de calidad, idoneidad y seguridad. El término es el que se indique en la ficha del producto o en la cotización; si no se indica, aplica el término legal de un (1) año desde la entrega.',
                'La garantía cubre defectos de fabricación y de instalación cuando la instalamos nosotros. Según el caso, reparamos la pieza; si el defecto se repite o no tiene arreglo, la cambiamos o te devolvemos el dinero.',
            ],
        },
        {
            id:      'exclusiones',
            heading: 'Cuándo no aplica la garantía',
            blocks:  [
                'Conforme al artículo 16 de la Ley 1480 de 2011, la garantía no cubre daños causados por:',
                {list: [
                    'Fuerza mayor o caso fortuito.',
                    'El hecho de un tercero, como golpes, modificaciones o reparaciones hechas por otras personas.',
                    'El uso indebido de la pieza.',
                    'No seguir las instrucciones de instalación, uso o mantenimiento que te entregamos.',
                ]},
            ],
        },
        {
            id:      'solicitud',
            heading: 'Cómo pedir un cambio o una garantía',
            blocks:  [
                `Escríbenos con tu nombre, el número de pedido o de solicitud, una descripción del problema y fotos. ${CONTACT_LINE}`,
                'Respondemos tu solicitud de garantía en un plazo máximo de quince (15) días hábiles. Si hace falta revisar la pieza, coordinamos contigo la visita o el envío.',
            ],
        },
        {
            id:      'restauracion',
            heading: 'Restauraciones',
            blocks:  ['En la restauración de muebles la garantía cubre el trabajo que hicimos (estructura, pintura o tapizado, según lo acordado), no el estado original de las partes que no se intervinieron.'],
        },
    ],
};
