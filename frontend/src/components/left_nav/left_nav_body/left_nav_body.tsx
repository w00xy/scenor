import './left_nav_body.scss';
import React, { JSX } from 'react';
import { useMenu } from '../../../context/MenuContext';

interface LNBodyProps {
    children: React.ReactNode;
    variant?: 'main' | 'settings';
    forceExpanded?: boolean;
}

export function LNBody({
    children,
    variant = 'main',
    forceExpanded = false,
}: LNBodyProps): JSX.Element {
    const { collapsed } = useMenu();
    const isCollapsed = forceExpanded ? false : collapsed;

    return (
        <div className={`left-menu__body left-menu__body--${variant} ${isCollapsed ? 'collapsed' : ''}`}>
            {children}
        </div>
    );
}
