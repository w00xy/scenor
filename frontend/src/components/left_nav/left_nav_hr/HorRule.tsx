import React, {JSX} from 'react';
import './HorRule.scss';
import { useMenu } from '../../../context/MenuContext';

export function HorRule(): JSX.Element {
    const { collapsed } = useMenu();
    return (
        <div className={`hr ${collapsed ? 'collapsed' : ''}`}></div>
    );
}