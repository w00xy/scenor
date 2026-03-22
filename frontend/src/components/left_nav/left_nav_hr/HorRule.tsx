import React, {JSX} from 'react';
import './HorRule.scss';
import { useMenu } from '../../../context/MenuContext'; // 根据实际路径调整

export function HorRule(): JSX.Element {
    const { collapsed } = useMenu();
    return (
        <div className={`hr ${collapsed ? 'collapsed' : ''}`}></div>
    );
}