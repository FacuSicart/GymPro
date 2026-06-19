import { env } from './env';

export type LocalUser = {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'TRAINER';
  status:
    | 'PENDING_APPROVAL'
    | 'ACTIVE'
    | 'REJECTED'
    | 'SUSPENDED'
    | 'DEACTIVATED';
  rejectionReason?: string | null;
  createdAt: string;
};

export type AuthProfile = {
  auth: {
    userId: string;
    email?: string;
  };
  user: LocalUser | null;
  canAccessInternalApp: boolean;
};

export type LoginResponse = {
  accessToken: string;
  user: LocalUser;
  canAccessInternalApp: boolean;
};

export type StudentProfile = {
  goal?: ExerciseGoal | null;
  experience?: string | null;
  age?: number | null;
  weightKg?: number | null;
  heightCm?: number | null;
  previousPhysicalNotes?: string | null;
  restrictions?: string | null;
  recurrentDiscomforts?: string | null;
  observations?: string | null;
};

export type Student = {
  id: string;
  tenantId: string;
  trainerId: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  status: 'ACTIVE' | 'ARCHIVED';
  profile: StudentProfile | null;
  createdAt: string;
  updatedAt: string;
};

export type StudentHistoryEvent = {
  id: string;
  studentId: string;
  type:
    | 'STUDENT_CREATED'
    | 'STUDENT_UPDATED'
    | 'PROFILE_UPDATED'
    | 'ROUTINE_CREATED'
    | 'ROUTINE_UPDATED'
    | 'ROUTINE_PUBLISHED'
    | 'ROUTINE_ARCHIVED'
    | 'TRAINING_SESSION_CREATED'
    | 'TRAINING_SESSION_STARTED'
    | 'TRAINING_SESSION_COMPLETED'
    | 'TRAINING_SESSION_CANCELLED'
    | 'TRAINING_SESSION_EXERCISE_UPDATED'
    | 'TRAINING_SESSION_DAY_COMPLETED'
    | 'TRAINING_FEEDBACK_SUBMITTED'
    | 'TRAINING_FEEDBACK_DISCOMFORT_REPORTED'
    | 'TRAINING_FEEDBACK_RECURRENT_DISCOMFORT_DETECTED';
  summary: string;
  metadata?: unknown;
  createdAt: string;
};

export type ExerciseApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ExerciseOperationalStatus = 'ACTIVE' | 'INACTIVE';
export type ExerciseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type ExerciseGoal =
  | 'STRENGTH'
  | 'HYPERTROPHY'
  | 'MOBILITY'
  | 'ENDURANCE'
  | 'CONDITIONING';

export type Exercise = {
  id: string;
  name: string;
  description: string;
  primaryMuscleGroup: string;
  secondaryMuscleGroups: string[];
  movementPattern: string;
  levels: ExerciseLevel[];
  equipmentNeeded: string;
  equipmentType: string;
  goals: ExerciseGoal[];
  technicalInstructions: string;
  commonMistakes?: string | null;
  contraindications?: string | null;
  videoUrl?: string | null;
  imageUrl?: string | null;
  approvalStatus: ExerciseApprovalStatus;
  operationalStatus: ExerciseOperationalStatus;
  createdByUserId: string;
  reviewedByUserId?: string | null;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RoutineStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
export type RoutineTemplateStatus = 'ACTIVE' | 'ARCHIVED';

export type RoutineExercise = {
  id: string;
  trainingDayId: string;
  exerciseId: string;
  order: number;
  sets?: number | null;
  repetitions?: string | null;
  restSeconds?: number | null;
  intensity?: string | null;
  tempo?: string | null;
  rir?: number | null;
  rpe?: number | null;
  observations?: string | null;
  exercise: Pick<
    Exercise,
    | 'id'
    | 'name'
    | 'description'
    | 'primaryMuscleGroup'
    | 'movementPattern'
    | 'equipmentNeeded'
    | 'equipmentType'
    | 'levels'
    | 'goals'
    | 'technicalInstructions'
    | 'commonMistakes'
    | 'contraindications'
    | 'videoUrl'
    | 'imageUrl'
  >;
};

export type TrainingDay = {
  id: string;
  name: string;
  order: number;
  exercises: RoutineExercise[];
};

export type RoutineVersion = {
  id: string;
  routineId: string;
  version: number;
  snapshot: unknown;
  createdByUserId: string;
  createdAt: string;
};

export type PublicRoutineLinkStatus = 'ACTIVE' | 'REVOKED';

export type PublicRoutineLink = {
  id: string;
  routineId: string;
  token: string;
  status: PublicRoutineLinkStatus;
  createdByUserId: string;
  revokedByUserId?: string | null;
  revokedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Routine = {
  id: string;
  studentId: string;
  trainerId: string;
  tenantId: string;
  name: string;
  description?: string | null;
  goal?: ExerciseGoal | null;
  daysPerWeek?: number | null;
  status: RoutineStatus;
  startDate?: string | null;
  endDate?: string | null;
  version: number;
  publishedAt?: string | null;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  student: Pick<Student, 'id' | 'firstName' | 'lastName' | 'email' | 'phone'>;
  days: TrainingDay[];
  versions: RoutineVersion[];
};

export type RoutineTemplateExercise = Omit<RoutineExercise, 'trainingDayId'> & {
  templateDayId: string;
};

export type RoutineTemplateDay = {
  id: string;
  name: string;
  order: number;
  exercises: RoutineTemplateExercise[];
};

export type RoutineTemplate = {
  id: string;
  trainerId: string;
  tenantId: string;
  name: string;
  description?: string | null;
  goal?: ExerciseGoal | null;
  daysPerWeek?: number | null;
  status: RoutineTemplateStatus;
  createdAt: string;
  updatedAt: string;
  trainer: { firstName: string; lastName: string };
  days: RoutineTemplateDay[];
};

export type PublicRoutineExercise = {
  id?: string;
  exerciseId?: string;
  order: number;
  sets?: number | null;
  repetitions?: string | null;
  restSeconds?: number | null;
  intensity?: string | null;
  tempo?: string | null;
  rir?: number | null;
  rpe?: number | null;
  observations?: string | null;
  exercise: {
    name: string;
    description?: string | null;
    primaryMuscleGroup?: string | null;
    movementPattern?: string | null;
    equipmentNeeded?: string | null;
    equipmentType?: string | null;
    technicalInstructions?: string | null;
    commonMistakes?: string | null;
    contraindications?: string | null;
    videoUrl?: string | null;
    imageUrl?: string | null;
  };
};

export type PublicRoutinePayload = {
  routine: {
    id?: string;
    name?: string;
    description?: string | null;
    goal?: ExerciseGoal | null;
    daysPerWeek?: number | null;
    version?: number;
    startDate?: string | null;
    endDate?: string | null;
  };
  student: {
    firstName?: string;
    lastName?: string;
  };
  trainer?: {
    firstName?: string;
    lastName?: string;
  };
  days: Array<{
    id?: string;
    name: string;
    order: number;
    exercises: PublicRoutineExercise[];
  }>;
};

export type TrainingSessionStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type TrainingSessionExercise = {
  id: string;
  trainingSessionDayId: string;
  order: number;
  exerciseName: string;
  exerciseVideoUrl?: string | null;
  exerciseImageUrl?: string | null;
  exerciseSnapshot?: unknown;
  plannedSets?: number | null;
  plannedRepetitions?: string | null;
  plannedRestSeconds?: number | null;
  plannedIntensity?: string | null;
  plannedTempo?: string | null;
  plannedRir?: number | null;
  plannedRpe?: number | null;
  completed: boolean;
  actualSets?: number | null;
  actualRepetitions?: string | null;
  actualLoad?: string | null;
  actualRestSeconds?: number | null;
  actualRir?: number | null;
  actualRpe?: number | null;
  trainerNotes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TrainingSessionDay = {
  id: string;
  name: string;
  order: number;
  completedAt?: string | null;
  exercises: TrainingSessionExercise[];
};

export type TrainingSession = {
  id: string;
  tenantId: string;
  studentId: string;
  trainerId: string;
  routineId: string;
  routineVersionId: string;
  status: TrainingSessionStatus;
  scheduledDate?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  student: Pick<Student, 'id' | 'firstName' | 'lastName'>;
  trainer: { firstName: string; lastName: string };
  routine: { id: string; name: string };
  routineVersion: number;
  days: TrainingSessionDay[];
};

export type PublicLinkTrainingSessionStatus = 'IN_PROGRESS' | 'COMPLETED';

export type PublicLinkTrainingSessionExercise = {
  id: string;
  order: number;
  exerciseName: string;
  exerciseVideoUrl?: string | null;
  exerciseImageUrl?: string | null;
  plannedSets?: number | null;
  plannedRepetitions?: string | null;
  plannedRestSeconds?: number | null;
  plannedIntensity?: string | null;
  plannedTempo?: string | null;
  plannedRir?: number | null;
  plannedRpe?: number | null;
  completed: boolean;
  actualSets?: number | null;
  actualRepetitions?: string | null;
  actualLoad?: string | null;
  actualRestSeconds?: number | null;
  actualRir?: number | null;
  actualRpe?: number | null;
  trainerNotes?: string | null;
};

export type PublicLinkTrainingSessionDay = {
  id: string;
  name: string;
  order: number;
  completedAt?: string | null;
  exercises: PublicLinkTrainingSessionExercise[];
};

export type PublicLinkTrainingSession = {
  id: string;
  status: PublicLinkTrainingSessionStatus;
  startedAt?: string | null;
  completedAt?: string | null;
  days: PublicLinkTrainingSessionDay[];
};

export type TrainingFeedback = {
  id: string;
  tenantId: string;
  studentId: string;
  trainerId: string;
  routineId: string;
  routineVersionId: string;
  trainingSessionId: string;
  trainingSessionDayId: string;
  publicRoutineLinkId?: string | null;
  difficultyScore: number;
  energyScore: number;
  completedWorkout: boolean;
  incompleteReason?: string | null;
  hadDiscomfort: boolean;
  discomfortArea?: string | null;
  discomfortIntensity?: number | null;
  discomfortDescription?: string | null;
  generalComment?: string | null;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
  student: Pick<Student, 'id' | 'firstName' | 'lastName'>;
  routine: { id: string; name: string };
  day: { id: string; name: string; order: number };
};

export type RecurrentDiscomfortAlert = {
  area: string;
  areaKey: string;
  reportCount: number;
  averageIntensity?: number | null;
  maxIntensity?: number | null;
  lastReportedAt: string;
  recentComments: string[];
  feedbackIds: string[];
};

export type PublicLinkFeedbackStatus = { pending: boolean; submittedAt?: string; dayName?: string } | null;

export type CreateTrainingFeedbackPayload = {
  difficultyScore: number;
  energyScore: number;
  completedWorkout: boolean;
  incompleteReason?: string;
  hadDiscomfort: boolean;
  discomfortArea?: string;
  discomfortIntensity?: number;
  discomfortDescription?: string;
  generalComment?: string;
};

export type CoverageBucket = {
  value: string;
  count: number;
  status: 'NO_COVERAGE' | 'LOW_COVERAGE' | 'SUFFICIENT';
};

export type ExerciseCoverage = {
  minimumPerBucket: number;
  muscleGroups: CoverageBucket[];
  goals: CoverageBucket[];
  levels: CoverageBucket[];
  equipment: CoverageBucket[];
  equipmentTypes: CoverageBucket[];
  movementPatterns: CoverageBucket[];
};

export type TrainerDashboardMetrics = {
  role: 'TRAINER';
  activeStudents: number;
  totalStudents: number;
  studentsCreatedThisMonth: number;
  activeRoutines: number;
  completedSessionsLast30Days: number;
  feedbackLast30Days: number;
  discomfortFeedbackLast30Days: number;
  studentsWithDiscomfortLast30Days: number;
  averageDifficultyLast30Days: number | null;
  averageEnergyLast30Days: number | null;
};

export type AdminDashboardMetrics = {
  role: 'ADMIN';
  pendingTrainers: number;
  activeTrainers: number;
  totalTrainers: number;
  totalStudents: number;
  studentsCreatedThisMonth: number;
  activeRoutines: number;
  completedSessionsLast30Days: number;
  feedbackLast30Days: number;
  discomfortFeedbackLast30Days: number;
};

export type DashboardMetrics =
  | TrainerDashboardMetrics
  | AdminDashboardMetrics;

const tokenKey = 'proyecto_gym_access_token';
const genericErrorMessage = 'No pudimos completar la acción. Intentá de nuevo.';
const knownApiMessages: Record<string, string> = {
  'Active trainer not found.': 'No encontramos un entrenador activo para asignar.',
  'Admin role is required.': 'No tenés permisos para realizar esta acción.',
  'Authenticated user is required.': 'Iniciá sesión para continuar.',
  'Archived routines cannot be edited.': 'No se puede editar una rutina archivada.',
  'Archived routines cannot be published.': 'No se puede publicar una rutina archivada.',
  'Archived templates cannot be assigned.': 'No se puede asignar una plantilla archivada.',
  'Archived templates cannot be edited.': 'No se puede editar una plantilla archivada.',
  'Approved exercises cannot be rejected.': 'No se puede rechazar un ejercicio ya aprobado.',
  'AI provider authentication failed.': 'La clave de OpenAI no es valida o no tiene acceso.',
  'AI provider model is not available.': 'El modelo configurado para IA no esta disponible en esta cuenta.',
  'AI provider quota exceeded.': 'La cuenta de OpenAI no tiene cuota disponible. Revisá billing o agregá crédito.',
  'AI provider rate limit exceeded.': 'OpenAI limito temporalmente la solicitud. Intentá de nuevo en unos minutos.',
  'AI provider request failed.': 'No pudimos completar la generacion con IA. Intentá de nuevo.',
  'AI response did not include structured routine output.': 'La IA no devolvio una rutina estructurada. Intentá de nuevo.',
  'AI response did not match the expected routine structure.': 'La IA devolvio una rutina incompleta. Intentá de nuevo.',
  'AI routine day count does not match the request.': 'La IA no respeto la cantidad de dias solicitada. Intentá de nuevo.',
  'AI routine duplicated an exercise inside the same day.': 'La IA repitio ejercicios dentro de un mismo dia. Intentá de nuevo.',
  'AI routine exercise count does not match the request.': 'La IA no respeto la cantidad de ejercicios por dia. Intentá de nuevo.',
  'AI routine generation is not configured.': 'La generacion con IA no esta configurada en el servidor.',
  'AI routine used an exercise outside the approved active catalog.': 'La IA intento usar un ejercicio fuera del catalogo aprobado.',
  'Bearer token is required.': 'Iniciá sesión para continuar.',
  'Catalog has insufficient approved active exercises.': 'El catalogo aprobado y activo no tiene suficientes ejercicios para esa rutina.',
  'Completed training days cannot be edited.': 'No se pueden editar días de entrenamiento ya completados.',
  'Email is already used by a platform user.': 'Ese email ya está usado por un usuario de la plataforma.',
  'Email is already used by another student.': 'Ese email ya está usado por otro alumno.',
  'Exercise not found.': 'No encontramos el ejercicio.',
  'Feedback already submitted for this training session.': 'El feedback ya fue enviado.',
  'Feedback not found.': 'No encontramos el feedback.',
  'Insufficient role.': 'No tenés permisos para realizar esta acción.',
  'Invalid email or password.': 'Email o contraseña incorrectos.',
  'Invalid token.': 'Tu sesión no es válida. Volvé a iniciar sesión.',
  'Invalid token signature.': 'Tu sesión no es válida. Volvé a iniciar sesión.',
  'Invalid trainer status.': 'El estado del entrenador no es válido.',
  'No completed training day pending feedback.': 'No hay un día completado pendiente de feedback.',
  'Only active trainers can be deactivated.': 'Solo se pueden desactivar entrenadores activos.',
  'Only draft routines can be deleted.': 'Solo se pueden eliminar rutinas en borrador. Las rutinas activas se archivan.',
  'Only planned sessions can be started.': 'Solo se pueden iniciar sesiones planificadas.',
  'Routine has no published snapshot yet.': 'La rutina todavía no tiene una versión publicada.',
  'Routine is not active.': 'La rutina no está activa.',
  'Routine must have a published snapshot before sharing.': 'La rutina debe tener una versión publicada antes de compartirla.',
  'Routine must have at least one day and one exercise before publishing.': 'Para activar la rutina, agregá al menos un día con un ejercicio.',
  'Routine not found.': 'No encontramos la rutina.',
  'Routine student cannot be changed.': 'No se puede cambiar el alumno de la rutina.',
  'Routine template not found.': 'No encontramos la plantilla.',
  'Session is not in progress.': 'La sesión no está en progreso.',
  'Start date cannot be after end date.': 'La fecha de inicio no puede ser posterior a la fecha de fin.',
  'Student not found.': 'No encontramos el alumno.',
  'This link is no longer available.': 'Este enlace ya no está disponible.',
  'Template must have at least one day.': 'La plantilla debe tener al menos un dia.',
  'Templates can only use approved and active catalog exercises.': 'La plantilla solo puede usar ejercicios aprobados y activos del catalogo.',
  'Token expired.': 'Tu sesión expiró. Volvé a iniciar sesión.',
  'Trainer cannot assign students to others.': 'No podés asignar alumnos a otro entrenador.',
  'Trainer is not pending approval.': 'El entrenador no está pendiente de aprobación.',
  'Trainer not found.': 'No encontramos el entrenador.',
  'Trainer role is required.': 'No tenés permisos para realizar esta acción.',
  'Training day not found.': 'No encontramos el día de entrenamiento.',
  'Training session not found.': 'No encontramos la sesión de entrenamiento.',
  'User is already registered.': 'Ese usuario ya está registrado.',
  'User is not active.': 'Tu usuario no está activo.',
  'User is not registered in this system.': 'Tu usuario no está registrado en el sistema.',
  'User not found.': 'No encontramos el usuario.',
  'One or more students were not found.': 'No encontramos uno o mas alumnos seleccionados.',
  'trainerId is required for admin-created students.': 'Seleccioná un entrenador para crear el alumno.',
};

function friendlyApiMessage(message: unknown, fallback = genericErrorMessage) {
  const rawMessage = Array.isArray(message) ? message[0] : message;

  if (typeof rawMessage !== 'string') {
    return fallback;
  }

  const trimmed = rawMessage.trim();
  if (!trimmed) {
    return fallback;
  }

  if (knownApiMessages[trimmed]) {
    return knownApiMessages[trimmed];
  }

  const lower = trimmed.toLowerCase();
  if (
    lower.includes('json') ||
    lower.includes('syntaxerror') ||
    lower.includes('unexpected token') ||
    lower.includes('request failed') ||
    lower.includes('internal server error') ||
    lower.includes('must be') ||
    lower.includes('should not') ||
    lower.includes('is not a valid') ||
    lower.includes('uuid')
  ) {
    return fallback;
  }

  return fallback;
}

async function readApiError(response: Response) {
  const fallback = genericErrorMessage;
  const text = await response.text().catch(() => '');

  if (!text) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(text) as { message?: unknown; error?: unknown };
    return friendlyApiMessage(parsed.message ?? parsed.error, fallback);
  } catch {
    return friendlyApiMessage(text, fallback);
  }
}

export function getStoredToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(tokenKey);
}

export function storeToken(token: string) {
  window.localStorage.setItem(tokenKey, token);
}

export function clearToken() {
  window.localStorage.removeItem(tokenKey);
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getStoredToken();
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  const text = await response.text();
  if (!text) {
    return null as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(genericErrorMessage);
  }
}

export function getProfile() {
  return apiFetch<AuthProfile>('/auth/me');
}

export function login(email: string, password: string) {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}
