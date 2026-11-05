import type {Metadata} from 'next';
import {Suspense} from 'react';
import LoginForm from '@/app/components/admin/loginform/LoginForm';

export const metadata: Metadata = {
    title:  'Ingresar al panel',
    robots: {index: false, follow: false},
};

export default function AdminLoginPage()
{
    return (
        <Suspense fallback={null}>
            <LoginForm />
        </Suspense>
    );
}
