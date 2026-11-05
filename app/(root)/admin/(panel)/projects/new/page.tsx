'use client';

import {useRouter} from 'next/navigation';
import {toast} from 'sonner';
import PageHeader from '@/app/components/admin/pageheader/PageHeader';
import ProjectForm from '@/app/components/admin/projectform/ProjectForm';
import {useFetch} from '@/hooks/useFetch';
import {useErrorToast} from '@/hooks/useErrorToast';
import type {ApiProject} from '@/app/interfaces/admin';

export default function NewProjectPage()
{
    const router = useRouter();

    const {data: types}                               = useFetch<string[]>('project/types', {requiresAuth: false});
    const {execute: create, isLoading: saving, error} = useFetch<ApiProject>('project', {method: 'POST', immediate: false});

    useErrorToast(error);

    const handleSubmit = async (payload: Record<string, unknown>) =>
    {
        const project = await create({body: payload});
        if (!project) return;
        toast.success('Proyecto creado. Ahora agrega sus fotos.');
        router.replace(`/admin/projects/${project.id}`);
    };

    return (
        <>
            <PageHeader title="Nuevo proyecto" description="Después de crearlo podrás agregar las fotos." />
            <ProjectForm types={types ?? []} saving={saving} onSubmit={handleSubmit} />
        </>
    );
}
