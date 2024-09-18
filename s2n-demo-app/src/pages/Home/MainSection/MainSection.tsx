import {
  Typography,
  Container,
  Box,
  alpha,
  LinearProgress,
} from "@mui/material";
import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import StopIcon from "@mui/icons-material/Stop";
import { useSnackbar } from "notistack";
import useAudioRecorder from "./useAudioRecorder";
import { ERROR_SNACKBAR_OPTIONS } from "../../../components/customSnackbar";
import { useEffect, useRef } from "react";
import { secondsToRecorderTime } from "./utils";
import { PrimaryButton } from "../../../components/buttons";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

export interface MainSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setResults: (results: any) => void;
}

export function MainSection({ setResults }: MainSectionProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { enqueueSnackbar } = useSnackbar();
  const {
    isRecording,
    startRecording,
    stopRecording,
    recordingBlob,
    recordingTime,
  } = useAudioRecorder({
    onNotAllowedOrFound: () => {
      enqueueSnackbar(
        "No se encontró un micrófono o se denegó el acceso",
        ERROR_SNACKBAR_OPTIONS
      );
    },
  });

  const mutation = useMutation({
    mutationFn: async (audioBlob: Blob) => {
      const formData = new FormData();
      formData.append("audio", audioBlob);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_API_URL}/s2n-demo`,
        formData
      );

      return response.data;
    },
    onError: (error) => {
      console.error("error");
      if (error instanceof AxiosError) {
        if (error.response?.status === 429) {
          enqueueSnackbar(
            "Lo sentimos, has alcanzado el límite de uso diario, por favor intenta mañana",
            ERROR_SNACKBAR_OPTIONS
          );
          return;
        }
        if (error.response?.status === 413) {
          enqueueSnackbar(
            "El archivo de audio es muy grande, por favor intenta de nuevo con un archivo más pequeño",
            ERROR_SNACKBAR_OPTIONS
          );
        }
      }
      enqueueSnackbar(
        "Ocurrió un error inesperado. Por favor, intenta de nuevo",
        ERROR_SNACKBAR_OPTIONS
      );
    },
    // to avoid 500 error while the lambda is cold
    retry: 2,
  });

  const onAccept = async () => {
    if (!recordingBlob) {
      enqueueSnackbar(
        "Por favor, graba un audio antes de continuar",
        ERROR_SNACKBAR_OPTIONS
      );
      return;
    }

    const results = await mutation.mutateAsync(recordingBlob);
    setResults(results);
  };

  useEffect(() => {
    if (recordingBlob) {
      const audioUrl = URL.createObjectURL(recordingBlob);
      audioRef.current!.src = audioUrl;
    }
  }, [recordingBlob]);

  return (
    <Container
      maxWidth="xl"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        my: 4,
      }}
    >
      <Box>
        <Typography
          variant="h1"
          component="h1"
          textAlign="center"
          sx={{
            fontFamily: "titleFontFamily",
            fontWeight: "medium",
            fontSize: { xs: 36, lg: 48 },
          }}
        >
          Fitvoice / Speech 2 Diet
        </Typography>
        <Typography variant="body1" textAlign="center" sx={{ mt: 2 }}>
          Presiona el botón y graba una descripción de una comida. Ejemplos:
          “Estoy comiendo una taza de arroz de coco con 50 gramos de salmón”,
          “Almorcé 150 g de arroz blanco con 120 gramos de carne de res y una
          papa cocida”, “Desayuno de 2 huevos y medio. Además una taza de café”
        </Typography>
      </Box>
      <Box my={5}>
        <Box
          sx={(theme) => ({
            width: { xs: "82px", lg: "96px" },
            height: { xs: "82px", lg: "96px" },
            backgroundColor: theme.palette.primary.main,
            borderRadius: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: theme.palette.primary.contrastText,
            cursor: "pointer",
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.85),
            },
          })}
          onClick={isRecording ? stopRecording : startRecording}
        >
          {isRecording ? (
            <StopIcon fontSize="large" />
          ) : (
            <KeyboardVoiceIcon fontSize="large" />
          )}
        </Box>
        <Typography
          variant="body1"
          textAlign="center"
          sx={{ mt: 2, fontSize: "1.2rem" }}
        >
          {secondsToRecorderTime(recordingTime)}
        </Typography>
      </Box>
      <Box
        sx={{
          width: { xs: "95%", md: "70%", lg: "65%" },
          display: "flex",
          justifyContent: "center",
        }}
      >
        <audio controls ref={audioRef} style={{ width: "100%" }}></audio>
      </Box>
      {mutation.isPending ? (
        <>
          <LinearProgress sx={{ width: "100%", mt: 4 }} />
          <Typography
            variant="body2"
            textAlign="center"
            sx={{ color: "text.secondary", mt: 1 }}
          >
            Esto puede tardar de 8 a 30 segundos. Si los servidores de Deepgram
            están saturados la capa gratuita no es priorizada lo que aumenta el
            tiempo de respuesta de esta petición.
          </Typography>
        </>
      ) : (
        <PrimaryButton size="small" onClick={onAccept} sx={{ px: 6, mt: 4 }}>
          Aceptar y ver resultados
        </PrimaryButton>
      )}
    </Container>
  );
}
