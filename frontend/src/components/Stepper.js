import React from 'react';

export default function Stepper({ steps, current }) {
  return (
    <div className="stepper">
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const state = stepNum < current ? 'done' : stepNum === current ? 'active' : 'upcoming';
        return (
          <React.Fragment key={label}>
            <div className={`stepper-item ${state}`}>
              <div className="stepper-circle">{state === 'done' ? '✓' : stepNum}</div>
              <div className="stepper-label">{label}</div>
            </div>
            {stepNum < steps.length && <div className={`stepper-line ${stepNum < current ? 'done' : ''}`} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}
