'use client';

import {useState, type FormEvent} from 'react';
import {useRouter} from 'next/navigation';
import {toast} from 'sonner';
import styles from '@/app/components/admin/admintable/admintable.module.css';
import PageHeader from '@/app/components/admin/pageheader/PageHeader';
import Modal from '@/app/components/ui/modal/Modal';
import Button from '@/app/components/ui/button/Button';
import Field, {Input, Select} from '@/app/components/ui/field/Field';
import Toggle from '@/app/components/ui/toggle/Toggle';
import StatusBadge from '@/app/components/ui/statusbadge/StatusBadge';
import {Edit, Plus} from '@/app/components/svg';
import {useFetch} from '@/hooks/useFetch';
import {useErrorToast} from '@/hooks/useErrorToast';
import {useAuth} from '@/context/AuthContext';
import {USER_ROLE_LABELS, UserRole, type InternalUser} from '@/app/interfaces/admin';

interface UserForm
{
    email: string; firstName: string; lastName: string; phone: string;
    role: UserRole.ADMIN | UserRole.EDITOR; password: string; isActive: boolean;
}

const EMPTY: UserForm = {email: '', firstName: '', lastName: '', phone: '', role: UserRole.EDITOR, password: '', isActive: true};

// Equipo interno: solo el dueño (ADMIN) entra aquí
export default function TeamPage()
{
    const {user}  = useAuth();
    const router  = useRouter();
    const isAdmin = user?.role === UserRole.ADMIN;

    const [editing, setEditing] = useState<InternalUser | null>(null);
    const [open,    setOpen]    = useState(false);
    const [form,    setForm]    = useState<UserForm>(EMPTY);

    const {data: users, execute: refetch} = useFetch<InternalUser[]>('user', {immediate: isAdmin});
    const {execute: save, isLoading: saving, error} = useFetch<InternalUser>('', {immediate: false});
    useErrorToast(error);

    if (user && !isAdmin)
    {
        router.replace('/admin');
        return null;
    }

    const openCreate = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
    const openEdit   = (member: InternalUser) =>
    {
        setEditing(member);
        setForm({email: member.email, firstName: member.firstName, lastName: member.lastName, phone: member.phone ?? '', role: member.role as UserForm['role'], password: '', isActive: member.isActive});
        setOpen(true);
    };

    const handleSubmit = async (e: FormEvent) =>
    {
        e.preventDefault();
        const base = {firstName: form.firstName.trim(), lastName: form.lastName.trim(), phone: form.phone.trim() || undefined, role: form.role};
        const ok   = editing
            ? await save({method: 'PATCH', body: {...base, isActive: form.isActive, ...(form.password && {password: form.password})}}, `user/${editing.id}`)
            : await save({method: 'POST', body: {...base, email: form.email.trim(), password: form.password}}, 'user');

        if (!ok) return;
        toast.success(editing ? 'Usuario actualizado' : 'Usuario creado');
        setOpen(false);
        refetch();
    };

    const validPassword = editing ? form.password === '' || form.password.length >= 10 : form.password.length >= 10;
    const valid         = form.firstName.trim().length >= 2 && form.lastName.trim().length >= 2 && (editing || form.email.includes('@')) && validPassword;

    return (
        <>
            <PageHeader
                title="Equipo"
                description="Quién puede entrar al panel. Los editores cargan productos y fotos, pero no cambian precios."
                actions={<Button icon={<Plus />} onClick={openCreate}>Agregar persona</Button>}
            />

            <div className={styles.wrapper}>
                <table className={styles.table}>
                    <thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Acceso</th><th aria-label="Acciones" /></tr></thead>
                    <tbody>
                        {users?.map(member => (
                            <tr key={member.id}>
                                <td className={styles.strong}>{member.firstName} {member.lastName}{member.id === user?.id && <span className={styles.muted}> (tú)</span>}</td>
                                <td className={styles.muted}>{member.email}</td>
                                <td>{USER_ROLE_LABELS[member.role]}</td>
                                <td><StatusBadge tone={member.isActive ? 'success' : 'muted'} label={member.isActive ? 'Activo' : 'Desactivado'} /></td>
                                <td><div className={styles.actions}><button type="button" className={styles.action} onClick={() => openEdit(member)} aria-label={`Editar ${member.firstName}`}><Edit /></button></div></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                open={open}
                title={editing ? 'Editar persona' : 'Agregar persona'}
                onClose={() => setOpen(false)}
                footer={(
                    <>
                        <Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
                        <Button type="submit" form="user-form" loading={saving} disabled={!valid}>Guardar</Button>
                    </>
                )}
            >
                <form id="user-form" className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.row}>
                        <Field label="Nombre" htmlFor="u-first"><Input id="u-first" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} /></Field>
                        <Field label="Apellido" htmlFor="u-last"><Input id="u-last" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} /></Field>
                    </div>
                    <Field label="Correo" htmlFor="u-email" hint={editing ? 'El correo no se puede cambiar.' : undefined}>
                        <Input id="u-email" type="email" value={form.email} disabled={!!editing} onChange={e => setForm({...form, email: e.target.value})} />
                    </Field>
                    <div className={styles.row}>
                        <Field label="Celular" htmlFor="u-phone"><Input id="u-phone" inputMode="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></Field>
                        <Field label="Rol" htmlFor="u-role">
                            <Select id="u-role" value={form.role} onChange={e => setForm({...form, role: e.target.value as UserForm['role']})}>
                                <option value={UserRole.EDITOR}>{USER_ROLE_LABELS[UserRole.EDITOR]}</option>
                                <option value={UserRole.ADMIN}>{USER_ROLE_LABELS[UserRole.ADMIN]}</option>
                            </Select>
                        </Field>
                    </div>
                    <Field label={editing ? 'Nueva contraseña' : 'Contraseña inicial'} htmlFor="u-pass" hint={editing ? 'Déjala vacía para no cambiarla. Cambiarla cierra sus sesiones.' : 'Mínimo 10 caracteres. Compártela por un canal privado.'}>
                        <Input id="u-pass" type="password" autoComplete="new-password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
                    </Field>
                    {editing && <Toggle id="u-active" label="Acceso al panel" hint="Al desactivarlo se cierran sus sesiones." checked={form.isActive} onChange={checked => setForm({...form, isActive: checked})} />}
                </form>
            </Modal>
        </>
    );
}
