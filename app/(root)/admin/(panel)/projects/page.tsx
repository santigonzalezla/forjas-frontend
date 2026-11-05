'use client';

import Image from 'next/image';
import Link from 'next/link';
import {toast} from 'sonner';
import table from '@/app/components/admin/admintable/admintable.module.css';
import styles from './projects.module.css';
import PageHeader from '@/app/components/admin/pageheader/PageHeader';
import ButtonLink from '@/app/components/ui/buttonlink/ButtonLink';
import StatusBadge from '@/app/components/ui/statusbadge/StatusBadge';
import ConfirmModal from '@/app/components/ui/confirmmodal/ConfirmModal';
import {Edit, ImageIcon, Plus, Trash} from '@/app/components/svg';
import {useFetch} from '@/hooks/useFetch';
import {useConfirm} from '@/hooks/useConfirm';
import {useErrorToast} from '@/hooks/useErrorToast';
import {useAuth} from '@/context/AuthContext';
import {UserRole, type ApiProject} from '@/app/interfaces/admin';

export default function ProjectsAdminPage()
{
    const {user}  = useAuth();
    const isAdmin = user?.role === UserRole.ADMIN;

    const {data: projects, isLoading, execute: refetch} = useFetch<ApiProject[]>('project/admin');
    const {execute: mutate, error}                      = useFetch<unknown>('', {immediate: false});
    const {confirm, confirmState, handleConfirm, handleCancel} = useConfirm();

    useErrorToast(error);

    const handleDelete = async (project: ApiProject) =>
    {
        if (!await confirm({title: 'Eliminar proyecto', message: `"${project.title}" dejará de verse en la página. Sus fotos se conservan en el almacenamiento.`, confirmLabel: 'Eliminar'})) return;
        if (!await mutate({method: 'DELETE'}, `project/${project.id}`)) return;
        toast.success('Proyecto eliminado');
        refetch();
    };

    return (
        <>
            <PageHeader
                title="Proyectos"
                description="El portafolio que se ve en la página de proyectos y en el inicio."
                actions={<ButtonLink href="/admin/projects/new" icon={<Plus />}>Nuevo proyecto</ButtonLink>}
            />

            {isLoading && !projects && <p className={table.empty}>Cargando proyectos…</p>}
            {projects?.length === 0 && <p className={table.empty}>Todavía no hay proyectos.</p>}

            {!!projects?.length && (
                <div className={table.wrapper}>
                    <table className={table.table}>
                        <thead>
                            <tr>
                                <th>Proyecto</th>
                                <th>Tipo</th>
                                <th>Fotos</th>
                                <th>Estado</th>
                                <th aria-label="Acciones" />
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map(project =>
                            {
                                const cover   = project.images.find(i => i.role === 'GALLERY') ?? project.images.find(i => i.role === 'AFTER') ?? project.images[0];
                                const isBA    = project.images.some(i => i.role === 'BEFORE') && project.images.some(i => i.role === 'AFTER');
                                return (
                                    <tr key={project.id}>
                                        <td>
                                            <Link href={`/admin/projects/${project.id}`} className={styles.project}>
                                                <span className={styles.thumb}>
                                                    {cover ? <Image src={cover.url} alt="" fill sizes="48px" className={styles.thumbImage} /> : <ImageIcon className={styles.noImage} />}
                                                </span>
                                                <span>
                                                    <span className={table.strong}>{project.title}</span>
                                                    <span className={styles.summary}>{project.summary}</span>
                                                </span>
                                            </Link>
                                        </td>
                                        <td className={table.muted}>{project.type}</td>
                                        <td className={table.muted}>{project.images.length}{isBA ? ' · antes y después' : ''}</td>
                                        <td>
                                            <span className={styles.badges}>
                                                <StatusBadge tone={project.isPublished ? 'success' : 'warning'} label={project.isPublished ? 'Publicado' : 'Borrador'} />
                                                {project.isFeatured && <StatusBadge tone="muted" label="En el inicio" />}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={table.actions}>
                                                <Link href={`/admin/projects/${project.id}`} className={table.action} title="Editar" aria-label={`Editar ${project.title}`}><Edit /></Link>
                                                {isAdmin && (
                                                    <button type="button" className={table.action} data-danger onClick={() => handleDelete(project)} title="Eliminar" aria-label={`Eliminar ${project.title}`}><Trash /></button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {confirmState && <ConfirmModal {...confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />}
        </>
    );
}
