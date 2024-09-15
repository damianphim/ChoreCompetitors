'use client'

// src/app/household/[id]/page.jsx
import { useParams } from 'next/navigation';
import { Container, Typography } from '@mui/material';
import Tasks from '../../components/tasks';
import Leaderboard from '../../components/leaderboard';
import Members from '../../components/members';

export default function HouseholdPage() {
  const { id } = useParams();  // Access dynamic parameter

  if (!id) return <p>Loading...</p>;

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Household {id}
      </Typography>
      <Tasks householdId={id} />
      <Leaderboard householdId={id} />
      <Members householdId={id} />
    </Container>
  );
}
