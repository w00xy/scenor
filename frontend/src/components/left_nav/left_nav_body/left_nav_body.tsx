import './left_nav_body.scss';
import React, { JSX } from 'react';
import { useMenu } from '../../../context/MenuContext';

interface LNBodyProps {
    children: React.ReactNode;
}

export function LNBody({ children }: LNBodyProps): JSX.Element {
    const { collapsed } = useMenu();

    return (
        <div className={`left-menu__body ${collapsed ? 'collapsed' : ''}`}>
            {children}
        </div>
    );
}