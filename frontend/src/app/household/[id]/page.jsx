'use client'

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Typography, Box } from '@mui/material';
import Tasks from '../../components/tasks';
import Leaderboard from '../../components/leaderboard';
import Members from '../../components/members';
import styles from '../../styles/page.module.css';
import React from "react";
import { styled } from "@mui/material/styles";
import Tab, { tabClasses } from "@mui/material/Tab";
import Tabs, { tabsClasses } from "@mui/material/Tabs";

// Styled Tab for Twitter-style
const TabItem = styled(Tab)(({ theme }) => ({
  minHeight: 53,
  minWidth: 80,
  textTransform: "none",
  fontSize: 15,
  fontWeight: 700,
  color: "#d69f8e",
  opacity: 1,
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: "#d69f8e",
  },
  [theme.breakpoints.up("md")]: {
    minWidth: 120,
  },
  [`&.${tabClasses.selected}`]: {
    color: "#d69f8e",
  },
}));

// Twitter-style Tabs
function TabsTwitter({ value, handleChange }) {
  return (
    <Tabs
      variant="fullWidth"
      textColor="inherit"
      value={value}
      onChange={handleChange}
      sx={{
        width: "100%",
        boxShadow: "inset 0 -1px 0 0 #E6ECF0",
        [`& .${tabsClasses.indicator}`]: {
          backgroundColor: "#d69f8e",
        },
      }}
    >
      <TabItem disableRipple label={"Tasks"} />
      <TabItem disableRipple label={"Leaderboard"} />
      <TabItem disableRipple label={"Members"} />
    </Tabs>
  );
}

// CustomTabPanel for content of each tab
function CustomTabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`}>
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function HouseholdPage() {
  const { id } = useParams();  // Access dynamic parameter
  const [tabIndex, setTabIndex] = useState(0); // State for the selected tab

  const handleChange = (event, newValue) => {
    setTabIndex(newValue); // Update the selected tab value
  };

  if (!id) return <p>Loading...</p>;

  return (
    <>
      <Typography className={styles.gradientText} variant="h4" gutterBottom>
        Household {id}
      </Typography>
      <Box
        sx={{
          width: '90vw',
          height: '80vh',
          backgroundColor: 'rgba(245, 245, 245, 0.3)',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          borderRadius: '20px',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        {/* Twitter-style Tabs */}
        <TabsTwitter value={tabIndex} handleChange={handleChange} />
      </Box>

      {/* Tab Panels for each tab */}
      <CustomTabPanel value={tabIndex} index={0}>
        <Tasks householdId={id} />
      </CustomTabPanel>
      <CustomTabPanel value={tabIndex} index={1}>
        <Leaderboard householdId={id} />
      </CustomTabPanel>
      <CustomTabPanel value={tabIndex} index={2}>
        <Members householdId={id} />
      </CustomTabPanel>
    </>
  );
}

export default HouseholdPage;
