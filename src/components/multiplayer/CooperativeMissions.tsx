import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Button, LinearProgress, Chip, Avatar, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import multiplayerService from '../../services/multiplayerService';
import { Mission } from '../../types/gameTypes';

// Styled components
const MissionCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
  background: 'rgba(20, 20, 30, 0.8)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(81, 81, 120, 0.5)',
  '&:hover': {
    boxShadow: '0 0 15px rgba(0, 200, 255, 0.5)',
    border: '1px solid rgba(0, 200, 255, 0.5)',
  },
}));

// Interface for the component props
interface CooperativeMissionsProps {
  sessionId: string;
  isHost: boolean;
}

const CooperativeMissions: React.FC<CooperativeMissionsProps> = ({ sessionId, isHost }) => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Load missions when component mounts
  useEffect(() => {
    // Get missions from the server or use default ones
    const session = multiplayerService.getActiveSession();
    if (session && session.currentMission) {
      setActiveMission(session.currentMission);
    } else {
      setMissions(defaultMissions);
    }

    // Listen for mission events
    const handleMissionStarted = (mission: Mission) => {
      setActiveMission(mission);
      setLoading(false);
    };

    const handleMissionProgress = (data: { missionId: string; progress: number; objectives: any[] }) => {
      setActiveMission(prev => {
        if (prev && prev.id === data.missionId) {
          return {
            ...prev,
            progress: data.progress,
            objectives: data.objectives
          };
        }
        return prev;
      });
    };

    const handleMissionCompleted = (data: { missionId: string; rewards: any }) => {
      setActiveMission(prev => {
        if (prev && prev.id === data.missionId) {
          return {
            ...prev,
            status: 'completed',
            progress: 100
          };
        }
        return prev;
      });
    };

    const handleSessionUpdated = (session: any) => {
      if (session && session.currentMission) {
        setActiveMission(session.currentMission);
      }
    };

    multiplayerService.on('mission_started', handleMissionStarted);
    multiplayerService.on('mission_progress', handleMissionProgress);
    multiplayerService.on('mission_completed', handleMissionCompleted);
    multiplayerService.on('session_updated', handleSessionUpdated);
    multiplayerService.on('session_synced', handleSessionUpdated);

    return () => {
      multiplayerService.off('mission_started', handleMissionStarted);
      multiplayerService.off('mission_progress', handleMissionProgress);
      multiplayerService.off('mission_completed', handleMissionCompleted);
      multiplayerService.off('session_updated', handleSessionUpdated);
      multiplayerService.off('session_synced', handleSessionUpdated);
    };
  }, []);

  const handleStartMission = (missionId: string) => {
    setLoading(true);
    multiplayerService.startMission(sessionId, missionId);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '#4caf50';
      case 'medium':
        return '#ff9800';
      case 'hard':
        return '#f44336';
      default:
        return '#2196f3';
    }
  };

  // Render active mission if there is one
  if (activeMission) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ color: '#0cf', mb: 2 }}>
          Active Mission: {activeMission.name}
        </Typography>
        
        <Paper sx={{ p: 2, mb: 3, background: 'rgba(20, 20, 30, 0.8)', border: '1px solid rgba(81, 81, 120, 0.5)' }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {activeMission.description}
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Progress: {activeMission.progress}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={activeMission.progress} 
              sx={{ 
                height: 10, 
                borderRadius: 5,
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: activeMission.progress === 100 ? '#4caf50' : '#0cf',
                }
              }} 
            />
          </Box>
          
          <Typography variant="subtitle1" gutterBottom>
            Objectives:
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            {activeMission.objectives.map((objective) => (
              <Box key={objective.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box 
                  sx={{ 
                    width: 20, 
                    height: 20, 
                    borderRadius: '50%', 
                    mr: 1,
                    border: '2px solid',
                    borderColor: objective.completed ? '#4caf50' : 'rgba(255, 255, 255, 0.5)',
                    backgroundColor: objective.completed ? 'rgba(76, 175, 80, 0.2)' : 'transparent',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  {objective.completed && (
                    <span style={{ color: '#4caf50', fontSize: '14px' }}>✓</span>
                  )}
                </Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    textDecoration: objective.completed ? 'line-through' : 'none',
                    color: objective.completed ? 'rgba(255, 255, 255, 0.6)' : 'white'
                  }}
                >
                  {objective.description}
                </Typography>
              </Box>
            ))}
          </Box>
          
          <Typography variant="subtitle1" gutterBottom>
            Rewards:
          </Typography>
          
          <Grid container spacing={2}>
            {activeMission.reward.experience && (
              <Grid item>
                <Chip 
                  label={`${activeMission.reward.experience} XP`} 
                  sx={{ backgroundColor: 'rgba(33, 150, 243, 0.2)', color: '#2196f3' }}
                />
              </Grid>
            )}
            <Grid item>
              <Chip 
                label={`${activeMission.reward.credits} Credits`} 
                sx={{ backgroundColor: 'rgba(255, 193, 7, 0.2)', color: '#ffc107' }}
              />
            </Grid>
            <Grid item>
              <Chip 
                label={`${activeMission.reward.dataShards} Data Shards`} 
                sx={{ backgroundColor: 'rgba(76, 175, 80, 0.2)', color: '#4caf50' }}
              />
            </Grid>
            <Grid item>
              <Chip 
                label={`${activeMission.reward.syntheticAlloys} Synthetic Alloys`} 
                sx={{ backgroundColor: 'rgba(76, 175, 80, 0.2)', color: '#4caf50' }}
              />
            </Grid>
            <Grid item>
              <Chip 
                label={`${activeMission.reward.quantumCores} Quantum Cores`} 
                sx={{ backgroundColor: 'rgba(76, 175, 80, 0.2)', color: '#4caf50' }}
              />
            </Grid>
          </Grid>
        </Paper>
        
        {activeMission.status === 'completed' && (
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: '#4caf50', mb: 1 }}>
              Mission Completed!
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => setActiveMission(null)}
              sx={{ 
                mt: 1,
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #21CBF3 30%, #2196F3 90%)',
                }
              }}
            >
              Return to Mission Selection
            </Button>
          </Box>
        )}
      </Box>
    );
  }

  // Mock missions data
  const defaultMissions: Mission[] = [
    {
      id: 'mission1',
      name: 'Arasaka Data Heist',
      description: 'Infiltrate Arasaka Corp servers and extract classified project data.',
      difficulty: 'medium',
      reward: {
        credits: 1500,
        dataShards: 75,
        syntheticAlloys: 30,
        quantumCores: 10,
        experience: 500
      },
      objectives: [
        {
          id: 'objective1',
          description: 'Hack the server',
          completed: false
        },
        {
          id: 'objective2',
          description: 'Extract the data',
          completed: false
        }
      ],
      status: 'available',
      progress: 0
    },
    {
      id: 'mission2',
      name: 'Quantum Vault Heist',
      description: 'Break into a secure quantum vault in Night City\'s financial district.',
      difficulty: 'hard',
      reward: {
        credits: 2500,
        dataShards: 120,
        syntheticAlloys: 60,
        quantumCores: 25,
        experience: 800
      },
      objectives: [
        {
          id: 'objective1',
          description: 'Disable the security system',
          completed: false
        },
        {
          id: 'objective2',
          description: 'Crack the vault',
          completed: false
        }
      ],
      status: 'available',
      progress: 0
    },
    {
      id: 'mission3',
      name: 'Syndicate Alliance',
      description: 'Form a temporary alliance with a rival syndicate to take down a common enemy.',
      difficulty: 'easy',
      reward: {
        credits: 1000,
        dataShards: 50,
        syntheticAlloys: 25,
        quantumCores: 5,
        experience: 300
      },
      objectives: [
        {
          id: 'objective1',
          description: 'Meet with rival syndicate',
          completed: false
        }
      ],
      status: 'available',
      progress: 0
    }
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom sx={{ color: '#0cf', mb: 2 }}>
        Available Missions
      </Typography>
      
      <Grid container spacing={2}>
        {defaultMissions.map((mission) => (
          <Grid item key={mission.id} xs={12} sm={6} md={4} lg={3}>
            <MissionCard>
              <Typography variant="h6" gutterBottom sx={{ color: '#0cf', mb: 1 }}>
                {mission.name}
              </Typography>
              
              <Typography variant="body1" sx={{ mb: 2 }}>
                {mission.description}
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Difficulty: {mission.difficulty}
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  Progress: {mission.progress}%
                </Typography>
              </Box>
              
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => handleStartMission(mission.id)}
                sx={{ 
                  mt: 1,
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #21CBF3 30%, #2196F3 90%)',
                  }
                }}
              >
                Start Mission
              </Button>
            </MissionCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CooperativeMissions;
