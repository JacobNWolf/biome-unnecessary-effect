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
      setTargetVolume(schedule.target_volume.toString());
      setTargetGmailVolume(schedule.target_gmail_volume.toString());
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
    setTitle('');
    setBody('');
  }, [open, itemId]);
  return `${title}${body}`;
}

export function BracedReturnModal({ isModalOpen, userId }: { isModalOpen: boolean; userId: string }) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState('');
  useEffect(() => { // expect: noResetAllStateOnPropChange
    if (!isModalOpen) {
      return;
    }
    setStep(0);
    setDraft('');
  }, [isModalOpen, userId]);
  return `${step}${draft}`;
}

export function PropsObjectModal(props: { isOpen: boolean; itemId: string }) {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  useEffect(() => { // expect: noResetAllStateOnPropChange
    if (!props.isOpen) return;
    setA('');
    setB('');
  }, [props.isOpen, props.itemId]);
  return `${a}${b}`;
}

export function ElseCloseResetModal({ visible, data }: { visible: boolean; data: object }) {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  useEffect(() => { // expect: noResetAllStateOnPropChange
    if (visible) {
      console.debug('open');
    } else {
      setA('');
      setB('');
    }
  }, [visible, data]);
  return `${a}${b}`;
}

export function VisibleModal({ isVisible, data }: { isVisible: boolean; data: object }) {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  useEffect(() => { // expect: noResetAllStateOnPropChange
    if (!isVisible) return;
    setA('');
    setB('');
  }, [isVisible, data]);
  return `${a}${b}`;
}

export function ShowModal({ show, data }: { show: boolean; data: object }) {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  useEffect(() => { // expect: noResetAllStateOnPropChange
    if (!show) return;
    setA('');
    setB('');
  }, [show, data]);
  return `${a}${b}`;
}

export function ShownModal({ isShown, data }: { isShown: boolean; data: object }) {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  useEffect(() => { // expect: noResetAllStateOnPropChange
    if (!isShown) return;
    setA('');
    setB('');
  }, [isShown, data]);
  return `${a}${b}`;
}

export function OpenedModal({ opened, data }: { opened: boolean; data: object }) {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  useEffect(() => { // expect: noResetAllStateOnPropChange
    if (!opened) return;
    setA('');
    setB('');
  }, [opened, data]);
  return `${a}${b}`;
}

export function UnrelatedGuard({ isOpen, userId }: { isOpen: boolean; userId: string }) {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  useEffect(() => { // expect: noResetAllStateOnPropChange
    if (isOpen) { // expect: noEventHandler
      console.debug('x');
    }
    setA(''); // expect: noAdjustStateOnPropChange
    setB(''); // expect: noAdjustStateOnPropChange
  }, [isOpen, userId]);
  return `${a}${b}`;
}

export function TabPanel({ isActive, tabId }: { isActive: boolean; tabId: string }) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  useEffect(() => { // expect: noResetAllStateOnPropChange
    if (isActive) {
      setQuery(''); // expect: noAdjustStateOnPropChange
      setPage(0); // expect: noAdjustStateOnPropChange
    }
  }, [isActive, tabId]);
  return `${query}${page}`;
}
