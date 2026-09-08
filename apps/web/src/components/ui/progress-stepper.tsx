"use client";

type Step = {
  id: string;
  label: string;
};

type Props = {
  steps: Step[];
  current: number;
  onSelect?: (index: number) => void;
};

export function ProgressStepper({ steps, current, onSelect }: Props) {
  return (
    <nav className="zed-stepper" aria-label="Progreso del proceso">
      {steps.map((step, index) => {
        const state =
          index < current ? "done" : index === current ? "current" : "todo";
        const clickable = Boolean(onSelect) && index <= current;
        return (
          <button
            key={step.id}
            type="button"
            className="zed-stepper__step"
            data-state={state}
            aria-current={index === current ? "step" : undefined}
            disabled={!clickable}
            onClick={() => onSelect?.(index)}
          >
            <span aria-hidden="true">{index + 1}</span>
            {step.label}
          </button>
        );
      })}
    </nav>
  );
}
