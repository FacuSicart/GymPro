import type { Prisma, StudentHistoryEvent, StudentProfile } from '@prisma/client';

type StudentWithProfile = Prisma.StudentGetPayload<{
  include: { profile: true };
}>;

function decimalToNumber(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'object' && 'toNumber' in value) {
    return (value as { toNumber: () => number }).toNumber();
  }

  return Number(value);
}

export function toPublicStudentProfile(profile?: StudentProfile | null) {
  if (!profile) {
    return null;
  }

  return {
    goal: profile.goal,
    experience: profile.experience,
    age: profile.age,
    weightKg: decimalToNumber(profile.weightKg),
    heightCm: decimalToNumber(profile.heightCm),
    previousPhysicalNotes: profile.previousPhysicalNotes,
    restrictions: profile.restrictions,
    recurrentDiscomforts: profile.recurrentDiscomforts,
    observations: profile.observations,
  };
}

export function toPublicStudent(student: StudentWithProfile) {
  return {
    id: student.id,
    tenantId: student.tenantId,
    trainerId: student.trainerId,
    firstName: student.firstName,
    lastName: student.lastName,
    email: student.email,
    phone: student.phone,
    status: student.status,
    profile: toPublicStudentProfile(student.profile),
    createdAt: student.createdAt,
    updatedAt: student.updatedAt,
  };
}

export function toPublicStudents(students: StudentWithProfile[]) {
  return students.map(toPublicStudent);
}

export function toPublicHistoryEvent(event: StudentHistoryEvent) {
  return {
    id: event.id,
    studentId: event.studentId,
    type: event.type,
    summary: event.summary,
    metadata: event.metadata,
    createdAt: event.createdAt,
  };
}

export function toPublicHistory(events: StudentHistoryEvent[]) {
  return events.map(toPublicHistoryEvent);
}
