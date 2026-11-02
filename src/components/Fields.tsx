import { useId, type ReactNode } from "react";
interface NumberProps {
  label: string;
  value: number;
  onChange: (n: number) => void;
  suffix?: string;
  hint?: string;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
}
export function NumberField({
  label,
  value,
  onChange,
  suffix,
  hint,
  min = 0,
  max = 1e9,
  step = 0.01,
  required,
}: NumberProps) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="input-wrap">
        {suffix === "R$" && <span className="prefix">R$</span>}
        <input
          id={id}
          type="number"
          inputMode={step === 1 ? "numeric" : "decimal"}
          min={min}
          max={max}
          step={step}
          required={required}
          value={value === 0 ? "" : value}
          placeholder="0"
          onChange={(e) =>
            onChange(e.target.value === "" ? 0 : Number(e.target.value))
          }
          aria-describedby={hint ? `${id}-hint` : undefined}
        />
        {suffix && suffix !== "R$" && <span className="suffix">{suffix}</span>}
      </div>
      {hint && <small id={`${id}-hint`}>{hint}</small>}
    </div>
  );
}
export function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
  hint,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: readonly (readonly [T, string])[];
  hint?: string;
}) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        aria-describedby={hint ? `${id}-hint` : undefined}
      >
        {options.map(([key, text]) => (
          <option value={key} key={key}>
            {text}
          </option>
        ))}
      </select>
      {hint && <small id={`${id}-hint`}>{hint}</small>}
    </div>
  );
}
export function DateField({
  label,
  value,
  onChange,
  optional = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  optional?: boolean;
}) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={!optional}
      />
    </div>
  );
}
export function CheckField({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (b: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="check">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{children}</span>
    </label>
  );
}
