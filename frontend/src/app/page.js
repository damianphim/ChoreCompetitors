// src/app/page.js
import Link from 'next/link';
import { Button, List, ListItem, Typography } from '@mui/material';

export default function Home() {
  const households = [
    { id: 1, name: 'Household 1' },
    { id: 2, name: 'Household 2' },
  ];

  return (
    <div>
      <Typography variant="h4">Your Households</Typography>
      <List>
        {households.map((household) => (
          <ListItem key={household.id}>
            <Link href={`/household/${household.id}`} passHref>
              <Button variant="contained" color="primary">
                {household.name}
              </Button>
            </Link>
          </ListItem>
        ))}
      </List>
    </div>
  );
}
