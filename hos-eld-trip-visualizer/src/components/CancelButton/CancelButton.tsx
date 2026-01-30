import React from 'react';
import styles from './CancelButton.module.css';

interface CancelButtonProps {
    label: string;
    onClick: () => void;
}

const CancelButton: React.FC<CancelButtonProps> = ({ label, onClick }) => {
    return (
        <button className={styles.button} type="button" onClick={onClick}>
            {label}
        </button>
    );
};

export default CancelButton;
