import { useState, useEffect } from 'react';
import List from '@mui/material/List';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import axios from 'axios';
import styles from '../styles/members.module.css';  // New CSS module for members

export default function Members({ householdId }) {
  const [members, setMembers] = useState([]);
  const [editingMemberId, setEditingMemberId] = useState(null);  // Track which member is being edited
  const [editMemberName, setEditMemberName] = useState('');  // Store the name being edited

  // Fetch members when the component loads
  useEffect(() => {
    axios.get(`http://localhost:5000/api/households/${householdId}/members`)
      .then(response => {
        setMembers(response.data);  // Update the state with the fetched members
      })
      .catch(error => console.error('Error fetching members:', error));
  }, [householdId]);

  // Function to add a new member
  const addMember = () => {
    if (members.length < 8) {
      const newMember = {
        name: `Member ${members.length + 1}`, // Dynamic member name
        stars: 0,  // New members should have 0 stars
      };

      // Send a request to the backend to add the new member
      axios.post(`http://localhost:5000/api/households/${householdId}/members`, newMember)
        .then(response => {
          setMembers([...members, response.data]);  // Update the state with the new member
        })
        .catch(error => console.error('Error adding member:', error));
    }
  };

  // Function to handle the edit click
  const handleEditClick = (member) => {
    setEditingMemberId(member.id);
    setEditMemberName(member.name);
  };

  // Function to save the changes to the backend
  const saveMemberChanges = (memberId) => {
    const memberToUpdate = members.find((member) => member.id === memberId);
  
    // Ensure both name and stars are sent to the backend
    axios.put(`http://localhost:5000/api/households/${householdId}/members/${memberId}`, { 
        name: editMemberName,
        stars: memberToUpdate.stars  // Include the existing stars value
      })
      .then(() => {
        setMembers(members.map(member =>
          member.id === memberId ? { ...member, name: editMemberName } : member
        ));
        setEditingMemberId(null);  // Exit edit mode
      })
      .catch(error => console.error('Error updating member name:', error));
  };
  

  return (
    <div className={styles.membersContainer}>
      <List className={styles.membersList}>
        {members.map((member) => (
          <Card
            variant="outlined"
            key={member.id}
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
            className={styles.memberCard}
          >
            <Box>
              {editingMemberId === member.id ? (
                <Box>
                  <TextField
                    value={editMemberName}
                    onChange={(e) => setEditMemberName(e.target.value)}
                    fullWidth
                    variant="outlined"
                    sx={{ marginBottom: '10px',
                          color: "#d69f8e"
                     }}
                  />
                  <Button
                    variant="contained"
                    onClick={() => saveMemberChanges(member.id)}
                    sx={{ marginRight: '10px',
                          backgroundColor: "#d69f8e"
                     }}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setEditingMemberId(null)}  // Cancel edit
                    sx={{
                      color: "#d69f8e",
                      borderColor: "#d69f8e"
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              ) : (
                <Box onClick={() => handleEditClick(member)}>
                  {member.name}
                </Box>
              )}
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
            cursor: members.length < 8 ? 'pointer' : 'not-allowed',
            textAlign: 'center',
            transition: 'transform 0.2s ease',
            '&:hover': members.length < 8 ? { transform: 'scale(1.05)', backgroundColor: '#f5f5f5' } : {},
            width: '100%',  // Ensure the card takes up full width of the List
            boxSizing: 'border-box',  // Ensure padding doesn't affect width
          }}
          className={styles.memberCard}
          onClick={members.length < 8 ? addMember : null}  // Disable click if limit is reached
        >
          <Box>
            {members.length < 8 ? '+ Add Member' : 'Limit Reached'}
          </Box>
        </Card>
      </List>
    </div>
  );
}
