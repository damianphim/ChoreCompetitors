import { useState } from 'react';
import { List, Card, Box } from '@mui/material';
import styles from '../styles/members.module.css';  // New CSS module for members

export default function Members({ householdId }) {
  const [members, setMembers] = useState([]);

  // Function to add a new member
  const addMember = () => {
    if (members.length < 8) {
      const newMember = {
        id: members.length + 1,
        name: `Member ${members.length + 1}`, // Dynamic member name
      };
      setMembers([...members, newMember]); // Updating the members array
    }
  };

  return (
    <div className={styles.membersContainer}>
      <List className={styles.membersList}>
        {members.map((member) => (
          <Card
            variant="outlined"
            key={member.id}
            contentEditable
            sx={{
              padding: '20px',
              background: 'rgb(255, 255, 255, 0)',
              boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.1)',
              color: 'white',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'transform 0.2s ease',
              '&:hover': { transform: 'scale(1.05)' },
              width: '100%',  // Ensure the card takes up full width of the List
              boxSizing: 'border-box',  // Ensure padding doesn't affect width
            }}
            className={styles.memberCard}  // Apply styles to fill width
          >
            <Box>
              {member.name}
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
            cursor: members.length < 6 ? 'pointer' : 'not-allowed',
            textAlign: 'center',
            transition: 'transform 0.2s ease',
            '&:hover': members.length < 8 ? { transform: 'scale(1.05)', backgroundColor: '#f5f5f5' } : {},
            width: '100%',  // Ensure the card takes up full width of the List
            boxSizing: 'border-box',  // Ensure padding doesn't affect width
          }}
          className={styles.memberCard}
          onClick={members.length < 6 ? addMember : null}
        >
          <Box>
            {members.length < 6 ? '+ Add Member' : 'Limit Reached'}
          </Box>
        </Card>
      </List>
    </div>
  );
}
