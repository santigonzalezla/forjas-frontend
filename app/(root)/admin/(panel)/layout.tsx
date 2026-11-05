import type {Metadata} from 'next';
import type {ReactNode} from 'react';
import PanelShell from '@/app/components/admin/panelshell/PanelShell';

export const metadata: Metadata = {
    title:  'Panel',
    robots: {index: false, follow: false},
};

export default function PanelLayout({children}: Readonly<{children: ReactNode}>)
{
    return <PanelShell>{children}</PanelShell>;
}
