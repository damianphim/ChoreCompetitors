import { useState, useEffect } from 'react';
import { List, Card, Box, Typography, IconButton, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import TimerIcon from '@mui/icons-material/Timer';
import StarIcon from '@mui/icons-material/Star';
import styles from '../styles/tasks.module.css';

export default function Tasks({ householdId }) {
  const [dailyTasks, setDailyTasks] = useState([]);
  const [weeklyTasks, setWeeklyTasks] = useState([]);
  const [monthlyTasks, setMonthlyTasks] = useState([]);
  const [editTask, setEditTask] = useState(null); // Track the task being edited
  const [editTaskName, setEditTaskName] = useState('');
  const [editTaskStars, setEditTaskStars] = useState(1);

  // Helper function to handle countdown timer
  const calculateRemainingTime = (task) => {
    const currentTime = new Date().getTime();
    const timeLeft = task.cooldownEnd - currentTime; // Time remaining in milliseconds
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    return `${hours}:${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };

  // Update tasks countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      setDailyTasks((tasks) => [...tasks]);
      setWeeklyTasks((tasks) => [...tasks]);
      setMonthlyTasks((tasks) => [...tasks]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const addTask = (taskType) => {
    const taskSetters = {
      daily: [dailyTasks, setDailyTasks],
      weekly: [weeklyTasks, setWeeklyTasks],
      monthly: [monthlyTasks, setMonthlyTasks],
    };
    const [tasks, setTasks] = taskSetters[taskType];

    if (tasks.length < 5) {
      const newTask = {
        id: tasks.length + 1,
        name: `${taskType.charAt(0).toUpperCase() + taskType.slice(1)} Task ${tasks.length + 1}`,
        stars: 1, // Base value of 1 star
        completed: false, // Track if the task is completed
        cooldownEnd: null, // Time until task can be completed again
      };
      setTasks([...tasks, newTask]);
    }
  };

  const completeTask = (taskType, taskId) => {
    const taskSetters = {
      daily: [dailyTasks, setDailyTasks],
      weekly: [weeklyTasks, setWeeklyTasks],
      monthly: [monthlyTasks, setMonthlyTasks],
    };
    const [tasks, setTasks] = taskSetters[taskType];

    const cooldownTime = taskType === 'daily' ? 24 * 60 * 60 * 1000 : taskType === 'weekly' ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;

    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: true, cooldownEnd: new Date().getTime() + cooldownTime } : task
    );
    setTasks(updatedTasks);
  };

  const openEditTask = (task) => {
    setEditTask(task);
    setEditTaskName(task.name);
    setEditTaskStars(task.stars);
  };

  const saveTaskChanges = (taskType) => {
    const taskSetters = {
      daily: [dailyTasks, setDailyTasks],
      weekly: [weeklyTasks, setWeeklyTasks],
      monthly: [monthlyTasks, setMonthlyTasks],
    };
    const [tasks, setTasks] = taskSetters[taskType];

    const updatedTasks = tasks.map(task =>
      task.id === editTask.id ? { ...task, name: editTaskName, stars: editTaskStars } : task
    );
    setTasks(updatedTasks);
    setEditTask(null);
  };

  // Render stars based on task's star count
  const renderStars = (stars) => (
    <Box display="flex" alignItems="center">
      {[...Array(5)].map((_, index) => (
        <StarIcon key={index} sx={{ color: index < stars ? 'yellow' : 'gray' }} />
      ))}
    </Box>
  );

  const renderTaskList = (tasks, title, taskType) => (
    <div className={styles.taskCategory}>
      <Typography variant="h6" sx={{ color: 'white', textAlign: 'center', marginBottom: '10px' }}>
        {title}
      </Typography>
      <List className={styles.tasksList}>
        {tasks.map((task) => (
          <Card
            variant="outlined"
            key={task.id}
            sx={{
              padding: '20px',
              background: task.completed ? 'rgba(0, 255, 0, 0.3)' : 'rgb(255, 255, 255, 0)',
              boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.1)',
              color: 'white',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'transform 0.2s ease',
              '&:hover': { transform: 'scale(1.05)' },
              width: '100%',
              boxSizing: 'border-box',
            }}
            className={styles.taskCard}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center">
                {renderStars(task.stars)} {/* Display stars next to task name */}
                <Box ml={2}>{task.name}</Box>
              </Box>
              <Box display="flex" alignItems="center" gap="10px">
                {!task.completed ? (
                  <>
                    <IconButton onClick={() => completeTask(taskType, task.id)}>
                      <CheckCircleOutlineIcon sx={{ color: 'white' }} />
                    </IconButton>
                    <IconButton onClick={() => openEditTask(task)}>
                      <EditIcon sx={{ color: 'white' }} />
                    </IconButton>
                  </>
                ) : (
                  <Box display="flex" alignItems="center">
                    <TimerIcon sx={{ color: 'white' }} />
                    {calculateRemainingTime(task)}
                  </Box>
                )}
              </Box>
            </Box>
          </Card>
        ))}
        <Card
          variant="outlined"
          sx={{
            padding: '20px',
            background: 'linear-gradient(135deg, #F0F0F0 0%, #FFFFFF 100%)',
            boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.1)',
            color: '#888',
            cursor: tasks.length < 8 ? 'pointer' : 'not-allowed',
            textAlign: 'center',
            transition: 'transform 0.2s ease',
            '&:hover': tasks.length < 8 ? { transform: 'scale(1.05)', backgroundColor: '#f5f5f5' } : {},
            width: '100%',
            boxSizing: 'border-box',
          }}
          className={styles.taskCard}
          onClick={tasks.length < 5 ? () => addTask(taskType) : null}
        >
          <Box>{tasks.length < 5 ? `+ Add ${title} Task` : 'Limit Reached'}</Box>
        </Card>
      </List>

      {/* Task Editing Modal */}
      <Dialog open={Boolean(editTask)} onClose={() => setEditTask(null)}>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          <TextField
            label="Task Name"
            value={editTaskName}
            onChange={(e) => setEditTaskName(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Typography variant="subtitle1">Stars</Typography>
          {[...Array(5)].map((_, index) => (
            <IconButton key={index} onClick={() => setEditTaskStars(index + 1)}>
              <StarIcon sx={{ color: index < editTaskStars ? 'yellow' : 'gray' }} />
            </IconButton>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => saveTaskChanges(taskType)}>Save</Button>
          <Button onClick={() => setEditTask(null)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </div>
  );

  return (
    <div className={styles.tasksContainer}>
      <div className={styles.taskCategory}>
        {renderTaskList(dailyTasks, 'Daily', 'daily')}
      </div>
      <div className={styles.dividerContainer}>
        <div className={styles.divider}></div>
      </div>
      <div className={styles.taskCategory}>
        {renderTaskList(weeklyTasks, 'Weekly', 'weekly')}
      </div>
      <div className={styles.dividerContainer}>
        <div className={styles.divider}></div>
      </div>
      <div className={styles.taskCategory}>
        {renderTaskList(monthlyTasks, 'Monthly', 'monthly')}
      </div>
    </div>
  );
}
