import { useState, useEffect } from 'react';
import { List, Card, Box, Typography, IconButton, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';
import axios from 'axios';
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
    const [editTaskType, setEditTaskType] = useState(''); // Track which type of task is being edited
    const [editTaskName, setEditTaskName] = useState('');
    const [editTaskStars, setEditTaskStars] = useState(1);
  
    // Helper function to handle countdown timer
    const calculateRemainingTime = (task) => {
        if (!task.cooldownEnd) return '';  // Return empty if cooldownEnd is not set
        
        const cooldownEnd = new Date(task.cooldownEnd).getTime();  // Convert to a valid timestamp
        const currentTime = new Date().getTime();
        const timeLeft = cooldownEnd - currentTime;
      
        if (timeLeft <= 0) return '00:00:00';  // Task is out of cooldown, return zero
      
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        return `${hours}:${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
      };      
  
    // Update tasks countdown every second
    useEffect(() => {
        axios.get('http://localhost:5000/api/tasks')
            .then(response => {
                const { dailyTasks, weeklyTasks, monthlyTasks } = response.data;
                setDailyTasks(dailyTasks);
                setWeeklyTasks(weeklyTasks);
                setMonthlyTasks(monthlyTasks);
            })
            .catch(error => console.error(error));

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
            household_id: householdId,  // Add the household_id
            name: `${taskType.charAt(0).toUpperCase() + taskType.slice(1)} Task ${tasks.length + 1}`,
            stars: 1,
            task_type: taskType,
            completed: false,
            cooldownEnd: null,
          };
          
          axios.post('http://localhost:5000/api/tasks', newTask)
            .then(response => setTasks([...tasks, response.data]))
            .catch(error => console.error(error));
        }
    };
    
    const completeTask = (taskType, taskId) => {
        const taskSetters = {
          daily: [dailyTasks, setDailyTasks],
          weekly: [weeklyTasks, setWeeklyTasks],
          monthly: [monthlyTasks, setMonthlyTasks],
        };
        const [tasks, setTasks] = taskSetters[taskType];
    
        const cooldownTime = taskType === 'daily' ? 24 * 60 * 60 * 1000 : 
                             taskType === 'weekly' ? 7 * 24 * 60 * 60 * 1000 : 
                             30 * 24 * 60 * 60 * 1000;
    
        const updatedTasks = tasks.map(task =>
          task.id === taskId ? { ...task, completed: true, cooldownEnd: new Date().getTime() + cooldownTime } : task
        );
        
        const updatedTask = updatedTasks.find(task => task.id === taskId);
        axios.put(`http://localhost:5000/api/tasks/${taskId}/complete`, {
            completed: true,
            cooldown_end: updatedTask.cooldownEnd
        })
        .then(() => setTasks(updatedTasks))
        .catch(error => console.error(error));
    };
    
    const openEditTask = (task, taskType) => {
      setEditTask(task);
      setEditTaskType(taskType); // Preserve the type of task being edited
      setEditTaskName(task.name);
      setEditTaskStars(task.stars);
    };
  
    const saveTaskChanges = () => {
        const taskSetters = {
          daily: [dailyTasks, setDailyTasks],
          weekly: [weeklyTasks, setWeeklyTasks],
          monthly: [monthlyTasks, setMonthlyTasks],
        };
        const [tasks, setTasks] = taskSetters[editTaskType]; // Use the correct task type
      
        const updatedTasks = tasks.map(task =>
          task.id === editTask.id ? { ...task, name: editTaskName, stars: editTaskStars } : task
        );
      
        const updatedTask = updatedTasks.find(task => task.id === editTask.id);
      
        // Send the updated task to the backend
        axios.put(`http://localhost:5000/api/tasks/${editTask.id}`, {
          name: editTaskName,
          stars: editTaskStars
        })
        .then(() => {
          setTasks(updatedTasks);  // Only update state if the backend update succeeds
          setEditTask(null);  // Close the edit dialog
        })
        .catch(error => console.error('Failed to update task', error));
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
                      <IconButton onClick={() => openEditTask(task, taskType)}>
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
            <Button onClick={saveTaskChanges}>Save</Button>
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
  