'use client';

import Link from 'next/link';
import {Suspense} from 'react';
import {useParams} from 'next/navigation';
import {toast} from 'sonner';
import styles from '../projects.module.css';
import PageHeader from '@/app/components/admin/pageheader/PageHeader';
import ProjectForm from '@/app/components/admin/projectform/ProjectForm';
import ImageManager from '@/app/components/admin/imagemanager/ImageManager';
import ButtonLink from '@/app/components/ui/buttonlink/ButtonLink';
import {External} from '@/app/components/svg';
import {useFetch} from '@/hooks/useFetch';
import {useErrorToast} from '@/hooks/useErrorToast';
import {PROJECT_IMAGE_ROLE_LABELS, type ApiProject, type ProjectImageRole} from '@/app/interfaces/admin';

const ROLES = (Object.keys(PROJECT_IMAGE_ROLE_LABELS) as ProjectImageRole[]).map(value => ({value, label: PROJECT_IMAGE_ROLE_LABELS[value]}));

function EditProject()
{
    const {id} = useParams<{id: string}>();

    const {data: project, execute: reload, error: loadError} = useFetch<ApiProject>(`project/admin/${id}`);
    const {data: types}                                      = useFetch<string[]>('project/types', {requiresAuth: false});
    const {execute: update, isLoading: saving, error}        = useFetch<ApiProject>(`project/${id}`, {method: 'PATCH', immediate: false});

    useErrorToast(error);

    const handleSubmit = async (payload: Record<string, unknown>) =>
    {
        if (!await update({body: payload})) return;
        toast.success('Cambios guardados');
        reload();
    };

    if (loadError) return <p className={styles.state}>No encontramos este proyecto. <Link href="/admin/projects">Volver a proyectos</Link></p>;
    if (!project) return <p className={styles.state}>Cargando…</p>;

    return (
        <>
            <PageHeader
                title={project.title}
                description={`Proyecto #${project.numId}`}
                actions={project.isPublished && <ButtonLink href={`/projects/${project.slug}`} variant="secondary" external icon={<External />}>Ver en la página</ButtonLink>}
            />
            <div className={styles.stack}>
                <ImageManager
                    basePath={`project/${project.id}`}
                    itemName={project.title}
                    images={project.images}
                    roles={ROLES}
                    onChange={reload}
                    hint="Galería: fotos del trabajo terminado (la primera es la portada). Para restauraciones sube una foto de Antes y una de Después: se muestran con el comparador."
                />
                <ProjectForm key={project.updatedAt} initial={project} types={types ?? []} saving={saving} onSubmit={handleSubmit} />
            </div>
        </>
    );
}

export default function EditProjectPage()
{
    return (
        <Suspense fallback={<p className={styles.state}>Cargando…</p>}>
            <EditProject />
        </Suspense>
    );
}
