import styles from './InputField.module.css';

type InputFieldProps = {
    type: "text" | "number";
    label: string;
    value?: string | number;
    placeholder?: string;
    readOnly?: boolean;
} & (
    // Discriminated Union
    | { readOnly: true; onChange?: never } 
    | { readOnly: false; onChange: Function }
)


const InputField = (props: InputFieldProps) => {
    const { type, label, value, placeholder } = props

    return (
        <div className={styles.container}>
            <label className={styles.label}>{label}</label>
            <input
                inputMode={ type == "number" ? "numeric" : "text"}

                placeholder={placeholder}
                readOnly={props.readOnly}
                value={value}

                onChange={(e) => {
                    let value = e.currentTarget.value
                    if (type == "number"){
                        value = value.replaceAll(/[^\d]+/g, "")
                        e.currentTarget.value = value
                    }


                    if (props.readOnly === false) {
                        props.onChange(value);
                    }
                }}

                className={styles.input}
            />
        </div>
    );
};

export default InputField;
