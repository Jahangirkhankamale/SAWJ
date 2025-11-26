import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { useAttendanceStore } from '../../stores/attendance';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AttendanceChart: React.FC = () => {
  const { attendanceRecords, classes } = useAttendanceStore();

  const chartData = useMemo(() => {
    // Get last 7 days
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }

    // Calculate attendance rates for each day
    const attendanceRates = days.map(date => {
      const dayRecords = attendanceRecords.filter(record => record.date === date);
      
      if (dayRecords.length === 0) return 0;
      
      let totalPresent = 0;
      let totalStudents = 0;
      
      dayRecords.forEach(record => {
        const presentCount = record.records.filter(r => 
          r.status === 'present' || r.status === 'late'
        ).length;
        totalPresent += presentCount;
        totalStudents += record.records.length;
      });
      
      return totalStudents > 0 ? (totalPresent / totalStudents) * 100 : 0;
    });

    // Format labels
    const labels = days.map(date => {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    });

    return {
      labels,
      datasets: [
        {
          label: 'Attendance Rate (%)',
          data: attendanceRates,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
        },
      ],
    };
  }, [attendanceRecords]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: 'rgb(243, 244, 246)',
        bodyColor: 'rgb(209, 213, 219)',
        borderColor: 'rgba(75, 85, 99, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            return `${Math.round(context.parsed.y)}% attendance`;
          },
        },
      },
    },
    scales: {
      x: {
        border: {
          display: false,
        },
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgb(107, 114, 128)',
          font: {
            size: 12,
          },
        },
      },
      y: {
        border: {
          display: false,
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.1)',
        },
        ticks: {
          color: 'rgb(107, 114, 128)',
          font: {
            size: 12,
          },
          callback: function(value: any) {
            return value + '%';
          },
        },
        min: 0,
        max: 100,
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  return (
    <div className="h-64">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default AttendanceChart;