'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, Square, RotateCcw, Coffee, Brain, Target, Clock,
  Settings, Volume2, VolumeX, Zap, Award, TrendingUp, Activity
} from 'lucide-react';
import { FocusSession, Todo } from '@/app/types/todo';

interface FocusTimerProps {
  todos: Todo[];
  selectedTasks?: string[];
  onSessionComplete: (session: Omit<FocusSession, 'id'>) => Promise<void>;
  onUpdateTask?: (taskId: string, updates: Partial<Todo>) => Promise<void>;
}

type SessionType = 'pomodoro' | 'deep_work' | 'sprint' | 'planning';
type TimerState = 'idle' | 'running' | 'paused' | 'break';

const SESSION_PRESETS = {
  pomodoro: { work: 25, shortBreak: 5, longBreak: 15, cycles: 4 },
  deep_work: { work: 90, shortBreak: 20, longBreak: 30, cycles: 2 },
  sprint: { work: 15, shortBreak: 3, longBreak: 10, cycles: 6 },
  planning: { work: 60, shortBreak: 10, longBreak: 20, cycles: 2 }
};

export const FocusTimer: React.FC<FocusTimerProps> = ({
  todos,
  selectedTasks = [],
  onSessionComplete,
  onUpdateTask
}) => {
  const [sessionType, setSessionType] = useState<SessionType>('pomodoro');
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [timeLeft, setTimeLeft] = useState(SESSION_PRESETS.pomodoro.work * 60);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [isBreak, setIsBreak] = useState(false);
  const [interruptions, setInterruptions] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [sessionTasks, setSessionTasks] = useState<string[]>(selectedTasks);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [sessionNotes, setSessionNotes] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context
  useEffect(() => {
    if (soundEnabled && !audioContextRef.current) {
      try {
        // @ts-expect-error - Safari compatibility
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      } catch (error) {
        console.log('Audio not supported');
      }
    }
  }, [soundEnabled]);

  // Timer logic
  useEffect(() => {
    if (timerState === 'running' && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState, timeLeft]);

  // Handle timer completion
  useEffect(() => {
    if (timeLeft === 0 && timerState === 'running') {
      handleTimerComplete();
    }
  }, [timeLeft, timerState]);

  const playSound = useCallback((type: 'start' | 'pause' | 'complete' | 'break') => {
    if (!soundEnabled || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    const frequencies = {
      start: [440, 554],
      pause: [440],
      complete: [523, 659, 784],
      break: [349, 440]
    };

    frequencies[type].forEach((freq, index) => {
      setTimeout(() => {
        oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        
        if (index === 0) {
          oscillator.start(ctx.currentTime);
        }
        if (index === frequencies[type].length - 1) {
          oscillator.stop(ctx.currentTime + 0.3);
        }
      }, index * 200);
    });
  }, [soundEnabled]);

  const handleTimerComplete = useCallback(async () => {
    const preset = SESSION_PRESETS[sessionType];
    
    if (isBreak) {
      // Break completed
      setIsBreak(false);
      setTimeLeft(preset.work * 60);
      setCurrentCycle(prev => prev + 1);
      playSound('start');
    } else {
      // Work session completed
      playSound('complete');
      
      if (currentCycle >= preset.cycles) {
        // Session fully completed
        await completeSession();
        resetTimer();
      } else {
        // Start break
        setIsBreak(true);
        const breakDuration = currentCycle % 4 === 0 ? preset.longBreak : preset.shortBreak;
        setTimeLeft(breakDuration * 60);
        playSound('break');
      }
    }
  }, [isBreak, currentCycle, sessionType, playSound]);

  const completeSession = async () => {
    if (!startTime) return;

    const session: Omit<FocusSession, 'id'> = {
      title: `${sessionType.replace('_', ' ')} Session`,
      start_time: startTime.toISOString(),
      end_time: new Date().toISOString(),
      planned_duration: SESSION_PRESETS[sessionType].work * SESSION_PRESETS[sessionType].cycles,
      actual_duration: Math.floor((new Date().getTime() - startTime.getTime()) / 1000 / 60),
      task_ids: sessionTasks,
      interruptions,
      environment_notes: sessionNotes,
      session_type: sessionType,
      completed: true,
      productivity_score: calculateProductivityScore()
    };

    await onSessionComplete(session);

    // Update completed tasks
    for (const taskId of completedTasks) {
      if (onUpdateTask) {
        await onUpdateTask(taskId, { 
          completed: true
        });
      }
    }
  };

  const calculateProductivityScore = () => {
    const preset = SESSION_PRESETS[sessionType];
    const expectedDuration = preset.work * preset.cycles;
    const actualDuration = startTime ? Math.floor((new Date().getTime() - startTime.getTime()) / 1000 / 60) : 0;
    
    const durationScore = Math.min(100, (actualDuration / expectedDuration) * 100);
    const interruptionPenalty = Math.max(0, 100 - (interruptions * 10));
    const taskCompletionBonus = (completedTasks.length / Math.max(1, sessionTasks.length)) * 20;
    
    return Math.round(Math.min(100, durationScore * 0.6 + interruptionPenalty * 0.3 + taskCompletionBonus * 0.1));
  };

  const startTimer = () => {
    if (timerState === 'idle') {
      setStartTime(new Date());
    }
    setTimerState('running');
    playSound('start');
  };

  const pauseTimer = () => {
    setTimerState('paused');
    playSound('pause');
  };

  const resetTimer = () => {
    setTimerState('idle');
    setTimeLeft(SESSION_PRESETS[sessionType].work * 60);
    setCurrentCycle(1);
    setIsBreak(false);
    setInterruptions(0);
    setStartTime(null);
    setCompletedTasks([]);
    setSessionNotes('');
  };

  const addInterruption = () => {
    setInterruptions(prev => prev + 1);
  };

  const toggleTaskCompletion = (taskId: string) => {
    setCompletedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionIcon = (type: SessionType) => {
    const icons = {
      pomodoro: '🍅',
      deep_work: '🧠',
      sprint: '⚡',
      planning: '📝'
    };
    return icons[type];
  };

  const selectedTaskObjects = todos.filter(todo => sessionTasks.includes(todo.id));
  const progress = SESSION_PRESETS[sessionType].work * 60 - timeLeft;
  const totalDuration = SESSION_PRESETS[sessionType].work * 60;
  const progressPercentage = (progress / totalDuration) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Focus Timer</h1>
        <p className="text-gray-400">Deep work sessions with productivity tracking</p>
      </div>

      {/* Session Type Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {(Object.keys(SESSION_PRESETS) as SessionType[]).map(type => (
          <button
            key={type}
            onClick={() => {
              if (timerState === 'idle') {
                setSessionType(type);
                setTimeLeft(SESSION_PRESETS[type].work * 60);
              }
            }}
            disabled={timerState !== 'idle'}
            className={`p-4 rounded-xl border-2 transition-all ${
              sessionType === type
                ? 'border-blue-500 bg-blue-500/20 text-white'
                : 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-white'
            } ${timerState !== 'idle' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="text-2xl mb-2">{getSessionIcon(type)}</div>
            <div className="font-medium capitalize">{type.replace('_', ' ')}</div>
            <div className="text-sm text-gray-400">{SESSION_PRESETS[type].work}m</div>
          </button>
        ))}
      </div>

      {/* Main Timer */}
      <div className="bg-gray-800/50 rounded-2xl p-8 mb-8 text-center">
        <div className="mb-6">
          <div className={`text-6xl font-mono font-bold ${
            isBreak ? 'text-green-400' : 'text-white'
          }`}>
            {formatTime(timeLeft)}
          </div>
          <div className="text-lg text-gray-400 mt-2">
            {isBreak ? '☕ Break Time' : `${sessionType.replace('_', ' ')} Session`}
          </div>
          <div className="text-sm text-gray-500">
            Cycle {currentCycle} of {SESSION_PRESETS[sessionType].cycles}
          </div>
        </div>

        {/* Progress Ring */}
        <div className="relative w-48 h-48 mx-auto mb-6">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              className="text-gray-700"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              strokeLinecap="round"
              className={isBreak ? 'text-green-400' : 'text-blue-400'}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: progressPercentage / 100 }}
              style={{
                pathLength: progressPercentage / 100,
                strokeDasharray: '283',
                strokeDashoffset: `${283 - (283 * progressPercentage) / 100}`
              }}
              transition={{ duration: 0.5 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">
              {isBreak ? '☕' : getSessionIcon(sessionType)}
            </span>
          </div>
        </div>

        {/* Timer Controls */}
        <div className="flex justify-center space-x-4">
          {timerState === 'idle' || timerState === 'paused' ? (
            <button
              onClick={startTimer}
              className="flex items-center space-x-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              <Play className="w-5 h-5" />
              <span>{timerState === 'idle' ? 'Start' : 'Resume'}</span>
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="flex items-center space-x-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
            >
              <Pause className="w-5 h-5" />
              <span>Pause</span>
            </button>
          )}
          
          <button
            onClick={resetTimer}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Reset</span>
          </button>

          <button
            onClick={addInterruption}
            disabled={timerState !== 'running'}
            className="flex items-center space-x-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap className="w-5 h-5" />
            <span>Interruption</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{interruptions}</div>
            <div className="text-sm text-gray-400">Interruptions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{completedTasks.length}</div>
            <div className="text-sm text-gray-400">Tasks Done</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {timerState !== 'idle' && startTime 
                ? Math.floor((new Date().getTime() - startTime.getTime()) / 1000 / 60)
                : 0}m
            </div>
            <div className="text-sm text-gray-400">Total Time</div>
          </div>
        </div>
      </div>

      {/* Task Management */}
      {selectedTaskObjects.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Session Tasks</span>
          </h3>
          <div className="space-y-3">
            {selectedTaskObjects.map(task => (
              <div key={task.id} className="flex items-center space-x-3">
                <button
                  onClick={() => toggleTaskCompletion(task.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    completedTasks.includes(task.id)
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-500 hover:border-gray-400'
                  }`}
                >
                  {completedTasks.includes(task.id) && <span className="text-xs">✓</span>}
                </button>
                <span className={`flex-1 ${
                  completedTasks.includes(task.id) ? 'line-through text-gray-500' : 'text-white'
                }`}>
                  {task.title}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  task.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                  task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-blue-500/20 text-blue-300'
                }`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Session Notes */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Session Notes</h3>
        <textarea
          value={sessionNotes}
          onChange={(e) => setSessionNotes(e.target.value)}
          placeholder="Jot down thoughts, insights, or environment notes..."
          className="w-full h-24 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Sound Toggle */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full shadow-lg transition-colors"
        >
          {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}; 