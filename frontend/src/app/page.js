'use client'

import { useState } from 'react';
import Link from 'next/link';
import { List, Card, Typography, Box } from '@mui/material';
import styles from './styles/page.module.css';

function Home() {
  const [households, setHouseholds] = useState([]);

  // Function to add a new household
  const addHousehold = () => {
    if(households.length < 4)
    {
      const newHousehold = {
        id: households.length + 1,
        name: `Household ${households.length + 1}`,
      };
      setHouseholds([...households, newHousehold]);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Typography  className={styles.gradientText} variant="h4">Chore <br /> &emsp;Competitor</Typography>
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