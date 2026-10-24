/** A real picture used for a workout style, and which part of it to keep in view. */
export interface WorkoutPhoto {
  src: string;
  /** CSS object-position: the focus point when the picture is cropped to fit. */
  position: string;
}

/** Workout styles that have a picture. The key is the training category id. */
export const WORKOUT_PHOTOS: Readonly<Record<string, WorkoutPhoto>> = {
  // Portrait picture: the figure sits in the middle band, so crop around it.
  calisthenics: { src: 'images/workouts/calisthenics.jpg', position: '50% 45%' },
  // Tall picture: anchored high enough that his hair and face stay in view.
  'hiit-crossfit': { src: 'images/workouts/hiit-crossfit.png', position: '50% 30%' },
  // Wide picture: the lifter fills the middle, so it fits any screen with only a light crop.
  strength: { src: 'images/workouts/strength.png', position: '50% 40%' },
  // Tall picture: keeps the face and the bar in view.
  powerlifting: { src: 'images/workouts/powerlifting.jpg', position: '50% 22%' },
  bodybuilding: { src: 'images/workouts/bodybuilding.avif', position: '50% 40%' },
};
