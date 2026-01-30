import styles from './ActionButton.module.css';

interface ActionButtonProps {
    label: string;
    onClick: () => void;
    disabled?: boolean
}

const ActionButton = ({ label, onClick, disabled }: ActionButtonProps) => {
    return (
        <button
            type="button" 
            className={styles.button}
            onClick={onClick}
            disabled={disabled}
        >
            {label}
        </button>
    );
};

export default ActionButton;
