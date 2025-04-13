'use client';
import { Box, Grid } from "@mui/material";
import LatestPosts from "../components/LatestPosts";
import WasteClassification from "../components/WasteClassification";
import UpcomingSchedules from "../components/UpcomingSchedules";
import GoalsList from "../components/GoalsList";
import ImpactStats from "../components/ImpactStats";

export default function HomeTab({ latestPosts, upcomingSchedules, goals, handleOpenDialog, onViewAllWasteTypes }) {
  return (
    <Box sx={{ py: 4, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Grid container spacing={4} justifyContent="center">
        {/* Left Column */}
        <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Latest Blog Posts */}
          <LatestPosts posts={latestPosts} />
          
          {/* Waste Classification Preview */}
          <WasteClassification 
            handleOpenDialog={handleOpenDialog} 
            onViewAllClick={onViewAllWasteTypes}
          />
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Upcoming Schedules */}
          <UpcomingSchedules schedules={upcomingSchedules} />
          
          {/* Goals */}
          <GoalsList goals={goals} />
          
          {/* Quick Stats */}
          <ImpactStats />
        </Grid>
      </Grid>
    </Box>
  );
}
