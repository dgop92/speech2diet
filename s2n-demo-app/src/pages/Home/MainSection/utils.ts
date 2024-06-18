export function secondsToRecorderTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const secondsAsStr = remainingSeconds.toString().padStart(2, "0");
  const minutesAsStr = minutes.toString().padStart(2, "0");

  return `${minutesAsStr}:${secondsAsStr}`;
}
