'use client';

import {useState, type FormEvent} from 'react';
import styles from '@/app/components/admin/adminform/adminform.module.css';
import Field, {Input, Textarea} from '@/app/components/ui/field/Field';
import Toggle from '@/app/components/ui/toggle/Toggle';
import Button from '@/app/components/ui/button/Button';
import type {ApiProject} from '@/app/interfaces/admin';

interface ProjectFormProps
{
    initial?:  ApiProject;
    types:     string[];
    saving:    boolean;
    onSubmit:  (payload: Record<string, unknown>) => void;
}

const toNumberOrNull = (value: string): number | null => (value.trim() === '' ? null : Number(value.replace(/\D/g, '')));

const ProjectForm = ({initial, types, saving, onSubmit}: ProjectFormProps) =>
{
    const [values, setValues] = useState(() => ({
        title:       initial?.title ?? '',
        type:        initial?.type ?? '',
        summary:     initial?.summary ?? '',
        description: initial?.description ?? '',
        location:    initial?.location ?? '',
        year:        initial?.year?.toString() ?? '',
        sortOrder:   initial?.sortOrder?.toString() ?? '0',
        isPublished: initial?.isPublished ?? false,
        isFeatured:  initial?.isFeatured ?? false,
    }));

    const set = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) => setValues(previous => ({...previous, [key]: value}));

    const handleSubmit = (event: FormEvent) =>
    {
        event.preventDefault();
        onSubmit({
            title:       values.title.trim(),
            type:        values.type.trim(),
            summary:     values.summary.trim(),
            description: values.description.trim() || null,
            location:    values.location.trim() || null,
            year:        toNumberOrNull(values.year),
            sortOrder:   toNumberOrNull(values.sortOrder) ?? 0,
            isPublished: values.isPublished,
            isFeatured:  values.isFeatured,
        });
    };

    const yearNumber = toNumberOrNull(values.year);
    const yearError  = yearNumber !== null && (yearNumber < 1997 || yearNumber > 2100) ? 'Forjas existe desde 1997: usa un año desde 1997.' : null;

    return (
        <form className={styles.layout} onSubmit={handleSubmit}>
            <div className={styles.main}>
                <section className={styles.card}>
                    <h2 className={styles.cardTitle}>Información</h2>
                    <Field label="Título" htmlFor="title">
                        <Input id="title" required minLength={2} maxLength={120} value={values.title} onChange={e => set('title', e.target.value)} placeholder="Portón y cerramiento" />
                    </Field>
                    <div className={styles.row}>
                        <Field label="Tipo de trabajo" htmlFor="type" hint="Sirve de filtro en la página de proyectos.">
                            <Input id="type" required minLength={2} maxLength={60} list="project-types" value={values.type} onChange={e => set('type', e.target.value)} placeholder="Ornamentación" />
                        </Field>
                        <datalist id="project-types">{types.map(type => <option key={type} value={type} />)}</datalist>
                        <Field label="Lugar" htmlFor="location" hint="Opcional">
                            <Input id="location" maxLength={120} value={values.location} onChange={e => set('location', e.target.value)} placeholder="Valledupar" />
                        </Field>
                        <Field label="Año" htmlFor="year" hint="Opcional" error={yearError}>
                            <Input id="year" inputMode="numeric" maxLength={4} value={values.year} onChange={e => set('year', e.target.value.replace(/\D/g, ''))} />
                        </Field>
                    </div>
                    <Field label="Resumen" htmlFor="summary" hint="Una frase. Aparece en la tarjeta del proyecto.">
                        <Input id="summary" required maxLength={200} value={values.summary} onChange={e => set('summary', e.target.value)} />
                    </Field>
                    <Field label="Descripción" htmlFor="description" hint="Opcional. Se muestra en la página del proyecto.">
                        <Textarea id="description" maxLength={5000} value={values.description} onChange={e => set('description', e.target.value)} />
                    </Field>
                </section>
            </div>

            <aside className={styles.side}>
                <section className={styles.card}>
                    <h2 className={styles.cardTitle}>Publicación</h2>
                    <Toggle id="isPublished" label="Publicado" hint={values.isPublished ? 'Visible en la página de proyectos.' : 'Solo se ve en el panel.'} checked={values.isPublished} onChange={checked => set('isPublished', checked)} />
                    <Toggle id="isFeatured" label="Destacar en el inicio" hint="Aparece en la grilla de proyectos del inicio." checked={values.isFeatured} onChange={checked => set('isFeatured', checked)} />
                    <Field label="Orden" htmlFor="sortOrder" hint="Los números menores salen primero.">
                        <Input id="sortOrder" inputMode="numeric" value={values.sortOrder} onChange={e => set('sortOrder', e.target.value.replace(/\D/g, ''))} />
                    </Field>
                    <Button type="submit" loading={saving} disabled={!!yearError || !values.title.trim() || !values.type.trim() || !values.summary.trim()}>
                        {initial ? 'Guardar cambios' : 'Crear proyecto'}
                    </Button>
                </section>
            </aside>
        </form>
    );
};

export default ProjectForm;
