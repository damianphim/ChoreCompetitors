import React from 'react';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import StarIcon from '@mui/icons-material/Star';
import styles from '../styles/leaderboard.module.css'; // Updated styles for leaderboard

// Sample player data
const players = [
  { id: 1, name: 'Eiden', stars: 2430, avatar: '/path/to/avatar1.jpg', rank: 1 },
  { id: 2, name: 'Jackson', stars: 1847, avatar: '/path/to/avatar2.jpg', rank: 2 },
  { id: 3, name: 'Emma Aria', stars: 1674, avatar: '/path/to/avatar3.jpg', rank: 3 },
  { id: 4, name: 'Sebastian', stars: 1124, avatar: '/path/to/avatar4.jpg', rankChange: 'up' },
  { id: 5, name: 'Jason', stars: 875, avatar: '/path/to/avatar5.jpg', rankChange: 'down' },
  { id: 6, name: 'Natalie', stars: 774, avatar: '/path/to/avatar6.jpg', rankChange: 'up' },
  { id: 7, name: 'Serenity', stars: 723, avatar: '/path/to/avatar7.jpg', rankChange: 'up' },
  { id: 8, name: 'Hannah', stars: 559, avatar: '/path/to/avatar8.jpg', rankChange: 'down' },
];

// Component for Top 3 Players (Podium Style)
const TopPlayersPodium = ({ players }) => (
  <Box className={styles.topPlayersPodium}>
    {/* Second Place */}
    <Box className={styles.podiumSecond}>
      <Avatar src={players[1].avatar} alt={players[1].name} className={styles.playerAvatar} />
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
      <Avatar src={players[0].avatar} alt={players[0].name} className={styles.playerAvatarChampion} />
      <Typography className={styles.playerNameChampion}>{players[0].name}</Typography>
      <Typography className={styles.playerStars}>
        {players[0].stars} <StarIcon sx={{ color: '#FFD700' }} />
      </Typography>
    </Box>

    {/* Third Place */}
    <Box className={styles.podiumThird}>
      <Avatar src={players[2].avatar} alt={players[2].name} className={styles.playerAvatar} />
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
    {players.slice(3).map((player, index) => (
      <Box className={styles.playerListItem} key={player.id}>
        <Typography className={styles.playerRank}>{index + 4}</Typography> {/* Left side: Rank */}
        <Box className={styles.playerInfo}>
          <Avatar src={player.avatar} alt={player.name} />
          <Typography className={styles.playerName}>{player.name}</Typography>
        </Box>
        <Box className={styles.playerStars}>
          <Typography>{player.stars}</Typography>
          <StarIcon sx={{ color: '#FFD700', marginLeft: '5px' }} />
        </Box>
      </Box>
    ))}
  </Box>
);

// Main Leaderboard Component
const Leaderboard = () => (
  <Box className={styles.leaderboardContainer}>
    <TopPlayersPodium players={players} />
    <PlayerList players={players} />
  </Box>
);

export default Leaderboard;
