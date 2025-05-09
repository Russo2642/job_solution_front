import { CircularProgress, Box, Typography, SxProps, Theme } from '@mui/material';
import { styled } from '@mui/material/styles';

interface LoadingIndicatorProps {
  text?: string;
  size?: number;
  fullPage?: boolean;
  withContainer?: boolean;
  containerStyles?: SxProps<Theme>;
  textStyles?: SxProps<Theme>;
}

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(3),
}));

const FullPageContainer = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(255, 255, 255, 0.8)',
  zIndex: 1000,
}));

const LoadingText = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(2),
  color: theme.palette.text.secondary,
}));

const LoadingIndicator = ({
  text = 'Загрузка...',
  size = 40,
  fullPage = false,
  withContainer = true,
  containerStyles,
  textStyles,
}: LoadingIndicatorProps) => {
  const content = (
    <>
      <CircularProgress size={size} color="primary" />
      {text && <LoadingText variant="body1" sx={textStyles}>{text}</LoadingText>}
    </>
  );

  if (fullPage) {
    return <FullPageContainer>{content}</FullPageContainer>;
  }

  if (withContainer) {
    return <LoadingContainer sx={containerStyles}>{content}</LoadingContainer>;
  }

  return <>{content}</>;
};

export default LoadingIndicator; 