import {revalidateTag} from 'next/cache';
import {NextResponse, type NextRequest} from 'next/server';

const ALLOWED_TAGS = ['products', 'projects', 'content'];

// El backend Nest llama este endpoint después de crear/editar productos o proyectos,
// así el sitio público se actualiza sin redeploy.
export async function POST(request: NextRequest)
{
    const secret = request.headers.get('x-revalidate-secret');

    if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET)
        return NextResponse.json({message: 'No autorizado'}, {status: 401});

    const {tags} = await request.json().catch(() => ({tags: []})) as {tags?: string[]};
    const valid  = (tags ?? []).filter(tag => ALLOWED_TAGS.includes(tag));

    valid.forEach(tag => revalidateTag(tag, 'max'));

    return NextResponse.json({revalidated: valid});
}
