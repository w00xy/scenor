import './left_nav_body.scss';
import React, { JSX } from 'react';
import { useMenu } from '../../../context/MenuContext';

interface LNBodyProps {
    children: React.ReactNode;
    variant?: 'main' | 'settings';
}

export function LNBody({ children, variant = 'main' }: LNBodyProps): JSX.Element {
    const { collapsed } = useMenu();

    return (
        <div className={`left-menu__body left-menu__body--${variant} ${collapsed ? 'collapsed' : ''}`}>
            {children}
        </div>
    );
}