'use client';

import React, { useState, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface WizardStepProps {
  title: string;
  children: ReactNode;
  isActive?: boolean;
}

export const WizardStep: React.FC<WizardStepProps> = ({ children, isActive = false }) => {
  if (!isActive) return null;
  return <div className="wizard-step">{children}</div>;
};

interface WizardProps {
  children: ReactNode;
  onComplete?: () => void;
}

export const Wizard: React.FC<WizardProps> = ({ children, onComplete }) => {
  const [activeStep, setActiveStep] = useState(0);
  const steps = React.Children.toArray(children);
  const isFirstStep = activeStep === 0;
  const isLastStep = activeStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete?.();
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(0, prev - 1));
  };

  // Clone the active step and pass isActive prop
  const activeStepElement = React.Children.map(steps, (step, index) => {
    if (React.isValidElement(step)) {
      return React.cloneElement(step, {
        isActive: index === activeStep,
      });
    }
    return step;
  });

  return (
    <div className="wizard">
      {/* Progress indicator */}
      <div className="flex justify-between mb-6">
        {steps.map((_, index) => (
          <div 
            key={index} 
            className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 
              ${index === activeStep 
                ? 'border-blue-600 bg-blue-100 text-blue-600' 
                : index < activeStep 
                  ? 'border-green-600 bg-green-100 text-green-600' 
                  : 'border-gray-300 bg-white text-gray-400'}`}
          >
            {index < activeStep ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <span className="text-sm font-medium">{index + 1}</span>
            )}
            {index < steps.length - 1 && (
              <div 
                className={`absolute top-5 w-full h-0.5 left-10 
                  ${index < activeStep ? 'bg-green-600' : 'bg-gray-300'}`}
                style={{ width: '100%' }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Title */}
      {React.isValidElement(steps[activeStep]) && (
        <h3 className="text-xl font-bold mb-4">
          {React.isValidElement(steps[activeStep]) && steps[activeStep].props.title}
        </h3>
      )}

      {/* Content */}
      <div className="mb-6">{activeStepElement}</div>
      
      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={isFirstStep}
          className={isFirstStep ? 'opacity-0' : ''}
        >
          Back
        </Button>
        
        <Button
          type="button"
          onClick={handleNext}
        >
          {isLastStep ? 'Complete' : 'Next'}
        </Button>
      </div>
    </div>
  );
}; 