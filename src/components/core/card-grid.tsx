import React from 'react';
import styles from './card-grid.module.css';

type CardGridProps = {
    columns?: number;
    children: React.ReactNode;
};

export default function CardGrid({columns = 3, children}: CardGridProps) {
    return (
        <div
            className={styles.cardGrid}
            style={{'--columns': columns} as React.CSSProperties}
        >
            {React.Children.map(children, (child, idx) => (
                <>
                    {child}
                </>
            ))}
        </div>
    );
}