export type CourseOfferStatus = "draft" | "published" | "archived";
export type CourseOfferGradeStatus = "open" | "closed";
export type CourseOfferGradingPolicy = "standard" | "unit" | "simal";
export type CourseOfferGradingScope = "course" | "unit";

export type CourseOffer = {
  id: number;
  courseId: number;
  sourceExternalClassId?: number | null;
  institution?: string | null;
  offerName: string;
  academicTerm: string;
  ownerTeacherId: number;
  description?: string | null;
  classDays?: string | null;
  classTime?: string | null;
  modality?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status: CourseOfferStatus;
  gradeStatus: CourseOfferGradeStatus;
  gradingPolicy: CourseOfferGradingPolicy;
  gradingScope: CourseOfferGradingScope;
  deletedAt?: string | null;
};

export type CourseOfferStudentStatus = "active" | "inactive" | "completed";

export type CourseOfferStudent = {
  id: number;
  offerId: number;
  userId?: number | null;
  externalStudentId?: number | null;
  name: string;
  socialName?: string | null;
  email?: string | null;
  studentIdNumber?: string | null;
  status: CourseOfferStudentStatus;
  notes?: string | null;
};

export type CourseOfferTeacher = {
  id: number;
  offerId: number;
  teacherId: number;
  assignedBy?: number | null;
  createdAt?: string | null;
};

export type CourseOfferListResponse = { offers: CourseOffer[] };
export type CourseOfferResponse = { offer: CourseOffer };
export type CourseOfferStudentsResponse = { students: CourseOfferStudent[] };
export type CourseOfferTeachersResponse = { teachers: CourseOfferTeacher[] };

export class CourseOfferApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "CourseOfferApiError";
  }
}
