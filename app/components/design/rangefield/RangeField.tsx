'use client';

import {useState} from 'react';
import styles from './rangefield.module.css';

interface RangeFieldProps
{
    id:       string;
    label:    string;
    value:    number;
    min:      number;
    max:      number;
    step?:    number;
    unit?:    string;
    onChange: (value: number) => void;
}

const RangeField = ({id, label, value, min, max, step = 5, unit = 'cm', onChange}: RangeFieldProps) =>
{
    const [draft, setDraft]       = useState<string | null>(null);
    const [lastValue, setLast]    = useState(value);

    if (value !== lastValue)
    {
        setLast(value);
        setDraft(null);
    }

    const commit = () =>
    {
        if (draft === null) return;
        const parsed = Number(draft);
        if (Number.isFinite(parsed)) onChange(Math.min(max, Math.max(min, Math.round(parsed))));
        setDraft(null);
    };

    const percent = ((value - min) / (max - min)) * 100;

    return (
        <div className={styles.field}>
            <div className={styles.head}>
                <label htmlFor={id} className={styles.label}>{label}</label>
                <span className={styles.number}>
                    <input
                        aria-label={`${label} en ${unit}`}
                        type="number"
                        inputMode="numeric"
                        min={min}
                        max={max}
                        value={draft ?? value}
                        onChange={event => setDraft(event.target.value)}
                        onBlur={commit}
                        onKeyDown={event => event.key === 'Enter' && commit()}
                    />
                    {unit}
                </span>
            </div>
            <input
                id={id}
                type="range"
                className={styles.range}
                min={min}
                max={max}
                step={step}
                value={value}
                style={{'--fill': `${percent}%`} as React.CSSProperties}
                onChange={event => onChange(Number(event.target.value))}
            />
            <div className={styles.scale}><span>{min}</span><span>{max} {unit}</span></div>
        </div>
    );
};

export default RangeField;
