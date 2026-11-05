import type {Metadata} from 'next';
import {Suspense} from 'react';
import ProjectDetail from '@/app/components/projects/projectdetail/ProjectDetail';
import {getProjectBySlug, getProjectSlugs} from '@/services/queries/content';

export async function generateStaticParams()
{
    const slugs = await getProjectSlugs();
    return slugs.map(slug => ({slug}));
}

export async function generateMetadata({params}: PageProps<'/projects/[slug]'>): Promise<Metadata>
{
    const {slug}  = await params;
    const project = await getProjectBySlug(slug);
    if (!project) return {title: 'Proyecto no encontrado'};

    return {
        title:       project.title,
        description: project.summary,
        openGraph:   {images: [{url: project.image.src, width: project.image.width, height: project.image.height, alt: project.image.alt}]},
    };
}

export default function ProjectPage({params}: PageProps<'/projects/[slug]'>)
{
    return (
        <Suspense fallback={<div className="container" style={{minHeight: '80svh'}} aria-busy="true" />}>
            <ProjectDetail params={params} />
        </Suspense>
    );
}
