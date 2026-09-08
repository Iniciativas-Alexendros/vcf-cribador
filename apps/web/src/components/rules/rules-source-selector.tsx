"use client";

type Mode = "builtin" | "toml";

type Props = {
  mode: Mode;
  onChange: (mode: Mode) => void;
};

export function RulesSourceSelector({ mode, onChange }: Props) {
  return (
    <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
      <legend className="zed-label">Origen de reglas</legend>
      <div className="zed-row">
        <label className="zed-button zed-button--secondary" style={{ cursor: "pointer" }}>
          <input
            type="radio"
            name="rules-mode"
            checked={mode === "builtin"}
            onChange={() => onChange("builtin")}
            style={{ marginRight: "0.4rem" }}
          />
          Reglas integradas
        </label>
        <label className="zed-button zed-button--secondary" style={{ cursor: "pointer" }}>
          <input
            type="radio"
            name="rules-mode"
            checked={mode === "toml"}
            onChange={() => onChange("toml")}
            style={{ marginRight: "0.4rem" }}
          />
          TOML personalizado
        </label>
      </div>
    </fieldset>
  );
}
