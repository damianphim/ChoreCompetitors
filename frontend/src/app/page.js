'use client'

import { useState, useEffect } from 'react';
import axios from 'axios';  // Or use fetch if preferred
import Link from 'next/link';
import List from '@mui/material/List';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import styles from './styles/page.module.css';

function Home() {
  const [households, setHouseholds] = useState([]);

  useEffect(() => {
    // Fetch households from Flask API
    axios.get('http://localhost:5000/api/households')
      .then(response => {
        setHouseholds(response.data);
      })
      .catch(error => console.error(error));
  }, []);

  // Function to add a new household
  const addHousehold = () => {
    const newHousehold = {
      name: `Household ${households.length + 1}`
    };
    axios.post('http://localhost:5000/api/households', newHousehold)
      .then(response => {
        setHouseholds([...households, response.data]);
      })
      .catch(error => console.error(error));
  };

  return (
    <div className={styles.pageContainer}>
      <Typography className={styles.gradientText} variant="h4">Chore <br /> &emsp;Competitors</Typography>
      <List>
        {households.map((household) => (
          <Link href={`/household/${household.id}`} passHref key={household.id}>
            <Card
              variant="outlined"
              sx={{
                maxWidth: 300,
                padding: '20px',
                background: 'linear-gradient(135deg, #FF5722 0%, #FF8A50 100%)',
                boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.1)',
                borderRadius: '20px',
                color: 'white',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'transform 0.2s ease',
                '&:hover': { transform: 'scale(1.05)' },
              }}
            >
              <Box className={styles.houseHoldBox}>
                {household.name}
              </Box>
            </Card>
          </Link>
        ))}
        <Card
          variant="outlined"
          sx={{
            maxWidth: 300,
            padding: '20px',
            background: 'linear-gradient(135deg, #F0F0F0 0%, #FFFFFF 100%)',
            boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.1)',
            borderRadius: '20px',
            color: '#888',
            cursor: households.length < 4 ? 'pointer' : 'not-allowed',
            textAlign: 'center',
            transition: 'transform 0.2s ease',
            '&:hover': households.length < 4 ? { transform: 'scale(1.05)', backgroundColor: '#f5f5f5' } : {},
          }}
          onClick={households.length < 4 ? addHousehold : null}  // Disable click if limit is reached
        >
          <Box className={styles.addHouseholdBox}>
            {households.length < 4 ? '+ Add Household' : 'Limit Reached'}
          </Box>
        </Card>
      </List>
    </div>
  );
}

export default Home;
