import { useEffect, useState } from 'react';

export function MixedHookInputs({ onTimeslotsLoaded }) {
  const bookingData = useBookerStoreContext();
  const [date, setDate] = useState('');
  const schedule = useAvailableSlots({ date, duration: bookingData.duration });
  useEffect(() => {
    onTimeslotsLoaded(schedule.data.slots); // expect: noPassLiveStateToParent
  }, [onTimeslotsLoaded, schedule]);
  return setDate;
}
