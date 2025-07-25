import React, {ReactNode} from 'react';
import styles from './card.module.css';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    children: ReactNode;
    className?: string;
    contentClassName?: string;
};

const Card: React.FC<CardProps> = ({children, title, className, contentClassName}) => {
    return (
        <div className={className}>
            {title && <h3 className={styles.cardTitle}>{title}</h3>}
            <div className={`${styles.card} ${contentClassName || ''}`}>{children}</div>
        </div>
    );
};

export default Card;
