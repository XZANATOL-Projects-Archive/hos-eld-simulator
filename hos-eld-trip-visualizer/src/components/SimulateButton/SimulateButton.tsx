import React from 'react';
import styles from './SimulateButton.module.css';

interface SimulateButtonProps {
    label: string;
    onClick: () => void;
    disabled?: boolean;
}

const SimulateButton: React.FC<SimulateButtonProps> = ({ label, onClick, disabled }) => {
    return (
        <button
            className={`${styles.button} ${disabled ? styles.disabled : styles.enabled}`}
            type="button"
            onClick={onClick}
            disabled={disabled}
        >
            {label}
        </button>
    );
};

export default SimulateButton;
