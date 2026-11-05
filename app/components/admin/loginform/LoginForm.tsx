'use client';

import {useEffect, useState, type FormEvent} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import styles from './loginform.module.css';
import Logo from '@/app/components/layout/logo/Logo';
import Field, {Input} from '@/app/components/ui/field/Field';
import Button from '@/app/components/ui/button/Button';
import {useAuth} from '@/context/AuthContext';

const safeNext = (value: string | null): string => (value && value.startsWith('/admin') ? value : '/admin');

const LoginForm = () =>
{
    const {login, isAuthenticated, isHydrated} = useAuth();
    const router       = useRouter();
    const searchParams = useSearchParams();
    const next         = safeNext(searchParams.get('next'));

    const [email,    setEmail]    = useState('');
    const [password, setPassword] = useState('');
    const [error,    setError]    = useState<string | null>(null);
    const [loading,  setLoading]  = useState(false);

    useEffect(() =>
    {
        if (isHydrated && isAuthenticated) router.replace(next);
    }, [isHydrated, isAuthenticated, router, next]);

    const handleSubmit = async (e: FormEvent) =>
    {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const message = await login(email.trim(), password);
        setLoading(false);

        if (message) return setError(message);
        router.replace(next);
    };

    return (
        <main className={styles.page}>
            <form className={styles.card} onSubmit={handleSubmit} noValidate>
                <Logo className={styles.logo} />
                <div>
                    <h1 className={styles.title}>Panel de Forjas</h1>
                    <p className={styles.subtitle}>Ingresa para administrar productos, categorías y el inicio de la tienda.</p>
                </div>

                <Field label="Correo" htmlFor="email">
                    <Input id="email" type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} />
                </Field>

                <Field label="Contraseña" htmlFor="password" error={error}>
                    <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} />
                </Field>

                <Button type="submit" loading={loading} disabled={!email || !password}>Ingresar</Button>
            </form>
        </main>
    );
};

export default LoginForm;
