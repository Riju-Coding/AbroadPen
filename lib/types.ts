export interface Country {
  id: string
  name: string
  code: string
  flagUrl?: string
  details?: string
  topUniversities?: string[] // Array of university IDs
  createdAt: Date
  updatedAt: Date
}

export interface State {
  id: string
  countryId: string
  name: string
  code: string
  createdAt: Date
  updatedAt: Date
}

export interface City {
  id: string
  stateId: string
  countryId: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface University {
  id: string
  name: string
  logoUrl?: string
  websiteUrl?: string
  countryId: string
  stateId: string
  cityId: string
  address: string

  // Recognitions
  recognitions: string[] // NMC, WHO, ECFMG, Others

  // Medium of Teaching
  mediumOfTeaching: string[] // English, Russian, Other

  // Course Details
  courseDuration: string // e.g., "6 years"
  eligibilityCriteria?: string // Rich text
  neetRequired: boolean
  currentlyEnrolledStudents: number
  intakePeriod: "January" | "September"

  // Media
  youtubeVideoUrl?: string

  // Faculties
  facultyIds: string[] // Array of faculty IDs

  // Year-wise Fees Structure (1st to 6th Year)
  feesStructure: {
    year1: YearFees
    year2: YearFees
    year3: YearFees
    year4: YearFees
    year5: YearFees
    year6: YearFees
  }

  // Commission
  commissionPercentage: number

  assignedConsultants: string[]
  createdAt: Date
  updatedAt: Date
}

export interface YearFees {
  tuitionFees: number
  hostelFees: number
  messCharges: number
  otherCharges: number
}

export interface College {
  id: string
  universityId: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface Course {
  id: string
  collegeId: string
  universityId: string
  name: string
  duration: string
  level: "undergraduate" | "postgraduate" | "diploma" | "certificate"
  tuitionFee: number
  applicationFee: number
  commissionPercentage: number
  createdAt: Date
  updatedAt: Date
}

export interface Lead {
  id: string
  name: string
  email: string
  phone: string
  countryId: string
  stateId?: string
  cityId?: string
  interestedCountries: string[]
  interestedCourses: string[]
  notes?: string
  status: "new" | "contacted" | "qualified" | "converted" | "lost"
  assignedConsultant?: string
  createdAt: Date
  updatedAt: Date
}

export interface Application {
  id: string
  leadId: string
  studentName: string
  studentEmail: string
  studentPhone: string
  universityId: string
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected" | "enrolled"
  applicationDate: Date
  documents: string[]
  assignedConsultant?: string
  createdAt: Date
  updatedAt: Date
}

export interface Student {
  id: string
  applicationId: string
  leadId: string
  name: string
  email: string
  phone: string
  universityId: string
  enrollmentDate: Date
  expectedGraduation: Date
  documents: string[]
  assignedConsultant?: string
  createdAt: Date
  updatedAt: Date
}

export interface Commission {
  id: string
  studentId: string
  applicationId: string
  consultantId: string
  universityId: string
  totalFeesAmount: number
  commissionPercentage: number
  commissionAmount: number
  status: "pending" | "paid"
  paidDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  uid: string
  email: string
  name: string
  phone?: string
  role: "super_admin" | "consultant"
  assignedUniversityIds?: string[]
  registered: boolean
  createdAt: Date
  updatedAt?: Date
}

export interface Faculty {
  id: string
  name: string
  designation: string
  department: string
  experience: string // e.g., "10 years"
  profileImageUrl?: string
  createdAt: Date
  updatedAt: Date
}
