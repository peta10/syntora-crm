'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/app/hooks/useUser';
import { useTaskCompletion } from '@/app/hooks/useTaskCompletion';
import XpNotification from './XpNotification';

export default function TaskCompletionListener() {
  const { user } = useUser();
  const { xpEvent, clearXpEvent } = useTaskCompletion(user?.id);

  return <XpNotification event={xpEvent} onComplete={clearXpEvent} />;
}
