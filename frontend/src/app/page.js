'use client'

import { useState } from 'react';
import Link from 'next/link';
import { List, Card, Typography, Box } from '@mui/material';
import styles from './styles/page.module.css';

export default function Home() {
  const [households, setHouseholds] = useState([]);

  // Function to add a new household
  const addHousehold = () => {
    const newHousehold = {
      id: households.length + 1,
      name: `Household ${households.length + 1}`,
    };
    setHouseholds([...households, newHousehold]);
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
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'transform 0.2s ease',
            '&:hover': { transform: 'scale(1.05)', backgroundColor: '#f5f5f5' },
          }}
          onClick={addHousehold}
        >
          <Box className={styles.addHouseholdBox}>
            + Add Household
          </Box>
        </Card>
      </List>
    </div>
  );
}
