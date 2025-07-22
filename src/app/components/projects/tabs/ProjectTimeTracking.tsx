import React, { useState } from 'react';
import { Project, ProjectTimeEntry } from '@/app/types/todo';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Timer,
  Play,
  Pause,
  Plus,
  DollarSign,
  Clock,
  Calendar,
  Users2,
  BarChart2,
  Edit2,
  Trash2,
  Filter,
  Search,
  ArrowUpDown
} from 'lucide-react';

interface ProjectTimeTrackingProps {
  project: Project;
}

export const ProjectTimeTracking: React.FC<ProjectTimeTrackingProps> = ({
  project
}) => {
  const [timeEntries, setTimeEntries] = useState<ProjectTimeEntry[]>([]);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ProjectTimeEntry | null>(null);
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [filterBillable, setFilterBillable] = useState<'all' | 'billable' | 'non_billable'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'duration' | 'rate'>('date');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleAddEntry = () => {
    // TODO: Implement time entry addition
    setShowAddEntry(false);
  };

  const handleEditEntry = (entry: ProjectTimeEntry) => {
    // TODO: Implement time entry editing
    setEditingEntry(null);
  };

  const handleDeleteEntry = (id: string) => {
    // TODO: Implement time entry deletion
  };

  const handleStartTimer = (taskId?: string) => {
    // TODO: Implement timer start
    setActiveTimer(taskId || 'general');
  };

  const handleStopTimer = () => {
    // TODO: Implement timer stop
    setActiveTimer(null);
  };

  const totalMinutes = timeEntries.reduce((acc, entry) => acc + (entry.duration_minutes || 0), 0);
  const billableMinutes = timeEntries
    .filter(entry => entry.billable)
    .reduce((acc, entry) => acc + (entry.duration_minutes || 0), 0);
  const totalBillableAmount = timeEntries
    .filter(entry => entry.billable)
    .reduce((acc, entry) => {
      const hours = (entry.duration_minutes || 0) / 60;
      return acc + (hours * (entry.billing_rate || 0));
    }, 0);

  const filteredEntries = timeEntries
    .filter(entry => {
      if (filterBillable === 'all') return true;
      return filterBillable === 'billable' ? entry.billable : !entry.billable;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.start_time).getTime() - new Date(a.start_time).getTime();
        case 'duration':
          return (b.duration_minutes || 0) - (a.duration_minutes || 0);
        case 'rate':
          return (b.billing_rate || 0) - (a.billing_rate || 0);
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Time Tracking</h2>
          <p className="text-gray-400">Track and manage project time</p>
        </div>
        <div className="flex items-center space-x-3">
          {activeTimer ? (
            <Button
              onClick={handleStopTimer}
              variant="destructive"
              className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
            >
              <Pause className="w-4 h-4 mr-2" />
              Stop Timer
            </Button>
          ) : (
            <Button
              onClick={() => handleStartTimer()}
              className="bg-green-500/20 text-green-400 hover:bg-green-500/30"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Timer
            </Button>
          )}
          <Button
            onClick={() => setShowAddEntry(true)}
            className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Time Entry
          </Button>
        </div>
      </div>

      {/* Time Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-gray-700/50 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{formatTime(totalMinutes)}</div>
              <div className="text-sm text-gray-400">Total Time</div>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{formatTime(billableMinutes)}</div>
              <div className="text-sm text-gray-400">Billable Time</div>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <BarChart2 className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {((billableMinutes / totalMinutes) * 100 || 0).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-400">Billable Ratio</div>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                ${totalBillableAmount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Billable Amount</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterBillable}
              onChange={(e) => setFilterBillable(e.target.value as any)}
              className="bg-gray-800 border-gray-700 text-gray-300 rounded-lg text-sm focus:ring-[#6E86FF] focus:border-[#6E86FF]"
            >
              <option value="all">All Entries</option>
              <option value="billable">Billable</option>
              <option value="non_billable">Non-Billable</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="w-4 h-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-800 border-gray-700 text-gray-300 rounded-lg text-sm focus:ring-[#6E86FF] focus:border-[#6E86FF]"
            >
              <option value="date">Date</option>
              <option value="duration">Duration</option>
              <option value="rate">Rate</option>
            </select>
          </div>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search time entries..."
            className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm focus:ring-[#6E86FF] focus:border-[#6E86FF]"
          />
        </div>
      </div>

      {/* Time Entries List */}
      <div className="grid gap-4">
        {filteredEntries.map((entry) => (
          <Card
            key={entry.id}
            className="bg-gray-900/50 border-gray-700/50 p-4 hover:border-gray-600/50 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className={`mt-1 p-2 rounded-lg ${
                  entry.billable ? 'bg-green-500/20' : 'bg-gray-500/20'
                }`}>
                  <Timer className={`w-4 h-4 ${
                    entry.billable ? 'text-green-400' : 'text-gray-400'
                  }`} />
                </div>
                <div>
                  <h3 className="font-medium text-white">
                    {entry.description || 'Time Entry'}
                  </h3>
                  <div className="flex items-center flex-wrap gap-4 mt-2 text-sm">
                    <div className="flex items-center text-gray-400">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{formatDate(entry.start_time)}</span>
                    </div>
                    <div className="flex items-center text-gray-400">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{formatTime(entry.duration_minutes || 0)}</span>
                    </div>
                    {entry.billable && entry.billing_rate && (
                      <div className="flex items-center text-gray-400">
                        <DollarSign className="w-4 h-4 mr-1" />
                        <span>${entry.billing_rate}/hr</span>
                      </div>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs border ${
                      entry.billable
                        ? 'text-green-400 bg-green-500/20 border-green-500/30'
                        : 'text-gray-400 bg-gray-500/20 border-gray-500/30'
                    }`}>
                      {entry.billable ? 'Billable' : 'Non-Billable'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingEntry(entry)}
                  className="text-gray-400 hover:text-white"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteEntry(entry.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {filteredEntries.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Timer className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No time entries found</h3>
            <p className="text-gray-400 mb-4">
              {filterBillable === 'all'
                ? 'Start tracking time for this project'
                : `No ${filterBillable} time entries found`}
            </p>
            <div className="flex items-center justify-center space-x-3">
              <Button
                onClick={() => handleStartTimer()}
                className="bg-green-500/20 text-green-400 hover:bg-green-500/30"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Timer
              </Button>
              <Button
                onClick={() => setShowAddEntry(true)}
                className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Time Entry
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Form */}
      {(showAddEntry || editingEntry) && (
        <Card className="bg-gray-900/50 border-gray-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {editingEntry ? 'Edit Time Entry' : 'Add Time Entry'}
          </h3>
          
          {/* Form fields will go here */}
          <div className="space-y-4">
            {/* TODO: Add form fields */}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddEntry(false);
                setEditingEntry(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => editingEntry ? handleEditEntry(editingEntry) : handleAddEntry()}
              className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white"
            >
              {editingEntry ? 'Update Time Entry' : 'Add Time Entry'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}; 