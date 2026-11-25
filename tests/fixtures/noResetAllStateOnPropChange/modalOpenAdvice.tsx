import { useEffect, useState } from 'react';

export function ScheduleModal({
  isOpen,
  schedule,
}: {
  isOpen: boolean;
  schedule: { id: string; target_volume: number; target_gmail_volume: number };
}) {
  const [targetVolume, setTargetVolume] = useState(schedule.target_volume.toString());
  const [targetGmailVolume, setTargetGmailVolume] = useState(schedule.target_gmail_volume.toString());
  useEffect(() => { // expect: noResetAllStateOnPropChange
    if (isOpen) {
      setTargetVolume(schedule.target_volume.toString()); // expect: noAdjustStateOnPropChange
      setTargetGmailVolume(schedule.target_gmail_volume.toString()); // expect: noAdjustStateOnPropChange
    }
  }, [isOpen, schedule]);
  return (
    <button
      type="button"
      onClick={() => {
        setTargetVolume('100');
        setTargetGmailVolume('50');
      }}
    >
      {targetVolume}:{targetGmailVolume}
    </button>
  );
}

export function EarlyReturnModal({ open, itemId }: { open: boolean; itemId: string }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  useEffect(() => { // expect: noResetAllStateOnPropChange
    if (!open) return;
    setTitle(''); // expect: noAdjustStateOnPropChange
    setBody(''); // expect: noAdjustStateOnPropChange
  }, [open, itemId]);
  return `${title}${body}`;
}

export function BracedReturnModal({ isFlowActive, userId }: { isFlowActive: boolean; userId: string }) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState('');
  useEffect(() => { // expect: noResetAllStateOnPropChange
    if (!isFlowActive) {
      return;
    }
    setStep(0); // expect: noAdjustStateOnPropChange
    setDraft(''); // expect: noAdjustStateOnPropChange
  }, [isFlowActive, userId]);
  return `${step}${draft}`;
}
