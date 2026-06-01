const CLICK_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3';

export const playClick = () => {
  const audio = new Audio(CLICK_SOUND_URL);
  audio.volume = 0.5;
  audio.play().catch(() => {}); // Ignore errors if user hasn't interacted yet
};
