import type {Metadata} from 'next';
import {Suspense} from 'react';
import ProjectsView from '@/app/components/projects/projectsview/ProjectsView';

export const metadata: Metadata = {
    title:       'Proyectos',
    description: 'Portones, barandas, fachadas, muebles y restauraciones hechas por Forjas en Valledupar.',
};

export default function ProjectsPage({searchParams}: PageProps<'/projects'>)
{
    return (
        <Suspense fallback={<div className="container" style={{minHeight: '80svh'}} aria-busy="true" />}>
            <ProjectsView searchParams={searchParams} />
        </Suspense>
    );
}
