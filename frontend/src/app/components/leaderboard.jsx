import { useState, useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import StarIcon from '@mui/icons-material/Star';
import axios from 'axios';
import styles from '../styles/leaderboard.module.css'; // Updated styles for leaderboard

const Leaderboard = ({ householdId }) => {
  const [members, setMembers] = useState([]);

  // Fetch members when the component loads
  useEffect(() => {
    axios.get(`http://localhost:5000/api/households/${householdId}/members`)
      .then(response => {
        // Sort members by stars in descending order
        const sortedMembers = response.data.sort((a, b) => b.stars - a.stars);
        setMembers(sortedMembers);
      })
      .catch(error => console.error('Error fetching members:', error));
  }, [householdId]);

  // Fallback data for top 3 if there aren't enough members
  const topThreePlaceholders = Array(3).fill({ name: '-', stars: 0, avatar: '', rank: '-' });

  // Top 3 members (or placeholders)
  const topThree = members.length >= 3 ? members.slice(0, 3) : [...members.slice(0, 3), ...topThreePlaceholders.slice(members.length)];

  // Remaining members
  const remainingMembers = members.slice(3);

  return (
    <Box className={styles.leaderboardContainer}>
      <TopPlayersPodium players={topThree} />
      <PlayerList players={remainingMembers} />
    </Box>
  );
};

// Component for Top 3 Players (Podium Style)
const TopPlayersPodium = ({ players }) => (
  <Box className={styles.topPlayersPodium}>
    {/* Second Place */}
    <Box className={styles.podiumSecond}>
      <Avatar src={players[1].avatar || ''} alt={players[1].name} className={styles.playerAvatar} />
      <Typography className={styles.playerName}>{players[1].name}</Typography>
      <Typography className={styles.playerStars}>
        {players[1].stars} <StarIcon sx={{ color: '#FFD700' }} />
      </Typography>
    </Box>

    {/* First Place (Champion) */}
    <Box className={styles.podiumFirst}>
      <Typography variant="h5" className={styles.championTitle}>
        🔥 Champion 🔥
      </Typography>
      <Avatar src={players[0].avatar || ''} alt={players[0].name} className={styles.playerAvatarChampion} />
      <Typography className={styles.playerNameChampion}>{players[0].name}</Typography>
      <Typography className={styles.playerStars}>
        {players[0].stars} <StarIcon sx={{ color: '#FFD700' }} />
      </Typography>
    </Box>

    {/* Third Place */}
    <Box className={styles.podiumThird}>
      <Avatar src={players[2].avatar || ''} alt={players[2].name} className={styles.playerAvatar} />
      <Typography className={styles.playerName}>{players[2].name}</Typography>
      <Typography className={styles.playerStars}>
        {players[2].stars} <StarIcon sx={{ color: '#FFD700' }} />
      </Typography>
    </Box>
  </Box>
);

// Component for Remaining Players
const PlayerList = ({ players }) => (
  <Box className={styles.mainList}>
    {players.length === 0 ? (
      <Typography>No members to display.</Typography>
    ) : (
      players.map((player, index) => (
        <Box className={styles.playerListItem} key={player.id}>
          <Typography className={styles.playerRank}>{index + 4}</Typography> {/* Left side: Rank */}
          <Box className={styles.playerInfo}>
            <Avatar src={player.avatar || ''} alt={player.name} />
            <Typography className={styles.playerName}>{player.name}</Typography>
          </Box>
          <Box className={styles.playerStars}>
            <Typography>{player.stars}</Typography>
            <StarIcon sx={{ color: '#FFD700', marginLeft: '5px' }} />
          </Box>
        </Box>
      ))
    )}
  </Box>
);

export default Leaderboard;
