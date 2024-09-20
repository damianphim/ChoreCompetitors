import { useState, useEffect } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import List from '@mui/material/List';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
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
  const [members, setMembers] = useState([]);
  const [showMemberList, setShowMemberList] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [editTaskType, setEditTaskType] = useState('');
  const [editTaskName, setEditTaskName] = useState('');
  const [editTaskStars, setEditTaskStars] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);

  // Helper function to handle countdown timer
  const calculateRemainingTime = (task) => {
    if (!task.cooldownEnd) return '';
    const cooldownEnd = new Date(task.cooldownEnd).getTime();
    const currentTime = new Date().getTime();
    const timeLeft = cooldownEnd - currentTime;

    if (timeLeft <= 0) return '00:00:00';
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    return `${hours}:${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };

  useEffect(() => {
    if (householdId) {
      axios.get(`http://localhost:5000/api/households/${householdId}/tasks`)
        .then(response => {
          const { dailyTasks, weeklyTasks, monthlyTasks } = response.data;
          setDailyTasks(dailyTasks.map(task => ({
            ...task,
            cooldownEnd: task.cooldown_end ? new Date(task.cooldown_end) : null
          })));
          setWeeklyTasks(weeklyTasks.map(task => ({
            ...task,
            cooldownEnd: task.cooldown_end ? new Date(task.cooldown_end) : null
          })));
          setMonthlyTasks(monthlyTasks.map(task => ({
            ...task,
            cooldownEnd: task.cooldown_end ? new Date(task.cooldown_end) : null
          })));
        })
        .catch(error => console.error(error));
      
      axios.get(`http://localhost:5000/api/households/${householdId}/members`)
        .then(response => setMembers(response.data))
        .catch(error => console.error('Error fetching members:', error));
    }

    const interval = setInterval(() => {
      setDailyTasks((tasks) => [...tasks]);
      setWeeklyTasks((tasks) => [...tasks]);
      setMonthlyTasks((tasks) => [...tasks]);
    }, 1000);

    return () => clearInterval(interval);
  }, [householdId]);

  const addTask = (taskType) => {
    const taskSetters = {
      daily: [dailyTasks, setDailyTasks],
      weekly: [weeklyTasks, setWeeklyTasks],
      monthly: [monthlyTasks, setMonthlyTasks],
    };
    const [tasks, setTasks] = taskSetters[taskType];

    if (tasks.length < 5) {
      const newTask = {
        household_id: householdId,
        name: `${taskType.charAt(0).toUpperCase() + taskType.slice(1)} Task ${tasks.length + 1}`,
        stars: 1,
        task_type: taskType,
        completed: false,
        cooldownEnd: null,
      };

      axios.post(`http://localhost:5000/api/households/${householdId}/tasks`, newTask)
        .then(response => setTasks([...tasks, response.data]))
        .catch(error => console.error(error));
    }
  };

  const completeTask = (taskType, taskId) => {
    setShowMemberList(taskId);
  };
  
  const openMemberMenu = (event, taskId) => {
    setAnchorEl(event.currentTarget);
    setShowMemberList(taskId);  // Track which task is showing the menu
  };

  const closeMemberMenu = () => {
    setAnchorEl(null);
    setShowMemberList(null);
  };

  const handleMemberSelection = (memberId, task) => {
    const taskSetters = {
      daily: [dailyTasks, setDailyTasks],
      weekly: [weeklyTasks, setWeeklyTasks],
      monthly: [monthlyTasks, setMonthlyTasks],
    };
    const [tasks, setTasks] = taskSetters[task.task_type];

    const selectedMember = members.find(member => member.id === memberId);
    if (selectedMember) {
      const updatedStars = selectedMember.stars + task.stars;
      axios.put(`http://localhost:5000/api/households/${householdId}/members/${memberId}`, {
        name: selectedMember.name,
        stars: updatedStars,
      })
      .then(() => {
        setMembers(members.map(member =>
          member.id === memberId ? { ...member, stars: updatedStars } : member
        ));

        const cooldownTime = task.task_type === 'daily' ? 24 * 60 * 60 * 1000 : 
                              task.task_type === 'weekly' ? 7 * 24 * 60 * 60 * 1000 : 
                              30 * 24 * 60 * 60 * 1000;

        const updatedTasks = tasks.map(t =>
          t.id === task.id ? { ...t, completed: true, cooldownEnd: new Date().getTime() + cooldownTime } : t
        );

        axios.put(`http://localhost:5000/api/households/${householdId}/tasks/${task.id}/complete`, {
          completed: true,
          cooldown_end: updatedTasks.find(t => t.id === task.id).cooldownEnd
        })
        .then(() => setTasks(updatedTasks))
        .catch(error => console.error(error));

        setShowMemberList(null);
      })
      .catch(error => console.error('Failed to update member stars', error));
    }
    closeMemberMenu();
  };

  const openEditTask = (task, taskType) => {
    setEditTask(task);
    setEditTaskType(taskType);
    setEditTaskName(task.name);
    setEditTaskStars(task.stars);
  }

  const saveTaskChanges = () => {
    const taskSetters = {
      daily: [dailyTasks, setDailyTasks],
      weekly: [weeklyTasks, setWeeklyTasks],
      monthly: [monthlyTasks, setMonthlyTasks],
    };
    const [tasks, setTasks] = taskSetters[editTaskType];

    const updatedTasks = tasks.map(task =>
      task.id === editTask.id ? { ...task, name: editTaskName, stars: editTaskStars } : task
    );

    axios.put(`http://localhost:5000/api/households/${householdId}/tasks/${editTask.id}`, {
      name: editTaskName,
      stars: editTaskStars
    })
    .then(() => {
      setTasks(updatedTasks);
      setEditTask(null);
    })
    .catch(error => console.error('Failed to update task', error));
  };

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
                {renderStars(task.stars)}
                <Box ml={2}>{task.name}</Box>
              </Box>
              <Box display="flex" alignItems="center" gap="10px">
                {!task.completed ? (
                  <>
                    {/* Button to open the member selection menu */}
                    <IconButton onClick={(event) => openMemberMenu(event, task.id)}>
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
  
            {/* Menu to select a member when task is completed */}
            <Menu
              anchorEl={anchorEl}
              open={showMemberList === task.id}
              onClose={closeMemberMenu}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              sx={{
                '& .MuiPaper-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.5)', // Setting the background color
                }
              }}
            >
              {members.map((member) => (
                <MenuItem key={member.id} onClick={() => handleMemberSelection(member.id, task)}>
                  <Typography>{member.name}</Typography>
                </MenuItem>
              ))}
            </Menu>
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
