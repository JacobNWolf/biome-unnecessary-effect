import { useEffect, useRef, useState } from 'react';

export function RisingEdgeModal({ isFlowActive, initialValue }: { isFlowActive: boolean; initialValue: string }) {
  const [value, setValue] = useState(initialValue);
  const [step, setStep] = useState(0);
  const wasActiveRef = useRef(isFlowActive);
  useEffect(() => { // expect: noResetAllStateOnPropChange
    if (isFlowActive && !wasActiveRef.current) {
      setValue(initialValue);
      setStep(0);
    }
    wasActiveRef.current = isFlowActive;
  }, [isFlowActive, initialValue]);
  return (
    <button type="button" onClick={() => setStep(step + 1)}>
      {value}
    </button>
  );
}

export function AutoAcceptModal({
  isFlowActive,
  initiallyEnabled,
  initialQualityValue,
  conditions,
}: {
  isFlowActive: boolean;
  initiallyEnabled: boolean;
  initialQualityValue: number;
  conditions: string[];
}) {
  const [enabled, setEnabled] = useState(initiallyEnabled);
  const [qualityValue, setQualityValue] = useState(initialQualityValue);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(conditions.length > 0);
  const [confirmVariant, setConfirmVariant] = useState<string | null>(null);
  const wasFlowActiveRef = useRef(isFlowActive);
  const prevConditionsLengthRef = useRef(conditions.length);
  useEffect(() => { // expect: noResetAllStateOnPropChange
    if (isFlowActive && !wasFlowActiveRef.current) {
      setEnabled(initiallyEnabled);
      setQualityValue(initialQualityValue);
      setIsAdvancedOpen(conditions.length > 0);
      setConfirmVariant(null);
    } else if (isFlowActive && prevConditionsLengthRef.current === 0 && conditions.length > 0) {
      setIsAdvancedOpen(true);
    }
    wasFlowActiveRef.current = isFlowActive;
    prevConditionsLengthRef.current = conditions.length;
  }, [isFlowActive, initiallyEnabled, initialQualityValue, conditions]);
  return (
    <button
      type="button"
      onClick={() => {
        setEnabled(!enabled);
        setQualityValue(qualityValue + 1);
        setIsAdvancedOpen(!isAdvancedOpen);
        setConfirmVariant('x');
      }}
    >
      {confirmVariant}
    </button>
  );
}

export function RisingEdgeWithId({ isFlowActive, itemId }: { isFlowActive: boolean; itemId: string }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const wasActiveRef = useRef(false);
  useEffect(() => { // expect: noResetAllStateOnPropChange
    if (isFlowActive && !wasActiveRef.current) {
      setTitle('');
      setBody('');
    }
    wasActiveRef.current = isFlowActive;
  }, [isFlowActive, itemId]);
  return (
    <button type="button" onClick={() => setTitle(body)}>
      {title}
    </button>
  );
}

export function RisingEdgeProps(props: { isFlowActive: boolean; initialValue: string }) {
  const [value, setValue] = useState(props.initialValue);
  const [step, setStep] = useState(0);
  const wasActiveRef = useRef(props.isFlowActive);
  useEffect(() => { // expect: noResetAllStateOnPropChange
    if (props.isFlowActive && !wasActiveRef.current) {
      setValue(props.initialValue);
      setStep(0);
    }
    wasActiveRef.current = props.isFlowActive;
  }, [props.isFlowActive, props.initialValue]);
  return (
    <button type="button" onClick={() => setStep(step + 1)}>
      {value}
    </button>
  );
}
