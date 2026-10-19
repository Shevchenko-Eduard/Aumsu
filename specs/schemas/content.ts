export type ID = string;
export type ISODateTime = string;
export type ISODate = string;
export type Locale = "ru" | "en";

export type Status =
  | "draft"
  | "review"
  | "scheduled"
  | "published"
  | "archived";

export type TranslationStatus = "complete" | "partial" | "missing";

export type Audience =
  | "applicant"
  | "parent"
  | "student"
  | "staff"
  | "alumni"
  | "partner"
  | "media"
  | "researcher";

export type OrgUnitType =
  | "faculty"
  | "institute"
  | "college"
  | "department"
  | "administration"
  | "branch"
  | "military-center";

export type ProgramLevel =
  | "bachelor"
  | "specialist"
  | "master"
  | "graduate"
  | "college"
  | "dpo";

export type StudyForm = "full-time" | "part-time" | "distance" | "mixed";

export type AdmissionLevel =
  | "bachelor"
  | "specialist"
  | "master"
  | "graduate"
  | "college"
  | "dpo"
  | "international";

export type DocumentMime =
  | "application/pdf"
  | "application/msword"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "application/vnd.ms-excel"
  | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  | "application/vnd.ms-powerpoint"
  | "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  | "application/zip";

export interface Seo {
  title: string;
  description: string;
  canonical?: string;
  ogImageId?: ID;
  noindex?: boolean;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface SocialLink {
  label: string;
  url: string;
  icon?: string;
}

export interface BaseEntity {
  id: ID;
  slug: string;
  status: Status;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  publishedAt?: ISODateTime;
  createdBy?: ID;
  updatedBy?: ID;
  deletedAt?: ISODateTime;
  locale: Locale;
  translationOf?: ID;
  translationStatus?: TranslationStatus;
}

export type Block =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 2 | 3 | 4; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][]; caption?: string }
  | { type: "image"; mediaId: ID; alt: string; caption?: string }
  | { type: "documents"; documentIds: ID[]; title?: string }
  | { type: "callout"; tone: "info" | "warning" | "success"; title?: string; text: string }
  | { type: "accordion"; items: Array<{ title: string; content: string }> }
  | { type: "contacts"; contactIds: ID[] }
  | { type: "html"; html: string };

export interface Page extends BaseEntity {
  path: string;
  sectionId: ID;
  title: string;
  subtitle?: string;
  summary?: string;
  body: Block[];
  heroImageId?: ID;
  audiences: Audience[];
  tags: string[];
  relatedIds: ID[];
  seo: Seo;
  template: "default" | "landing" | "article" | "documents" | "sveden" | "contact";
}

export interface Section {
  id: ID;
  key:
    | "about"
    | "admissions"
    | "education"
    | "science"
    | "student-life"
    | "international"
    | "news"
    | "contacts";
  title: string;
  path: string;
  parentId?: ID;
  order: number;
  visible: boolean;
  description?: string;
  icon?: string;
  seo: Seo;
  status: Status;
}

export interface UniversityInfo {
  id: ID;
  fullName: string;
  shortName: string;
  legalAddress: string;
  postalAddress?: string;
  phones: string[];
  emails: string[];
  website: string;
  foundedAt: ISODate;
  rectorId?: ID;
  workingHours?: string;
  map?: GeoPoint;
  socialLinks: SocialLink[];
  svedenUrl: string;
  updatedAt: ISODateTime;
}

export interface OrgUnit extends BaseEntity {
  type: OrgUnitType;
  name: string;
  shortName?: string;
  path: string;
  parentId?: ID;
  headId?: ID;
  headTitle?: string;
  description: Block[];
  address?: string;
  phones: string[];
  emails: string[];
  siteUrl?: string;
  workingHours?: string;
  programIds: ID[];
  employeeIds: ID[];
  documentIds: ID[];
  regulationDocumentId?: ID;
  imageId?: ID;
  order: number;
  seo: Seo;
}

export interface Employee extends BaseEntity {
  fullName: string;
  displayName?: string;
  position: string;
  degree?: string;
  academicTitle?: string;
  departmentId?: ID;
  unitIds: ID[];
  emails: string[];
  phones: string[];
  office?: string;
  photoId?: ID;
  bio: Block[];
  disciplines: string[];
  education: string[];
  qualifications: string[];
  experienceYears?: number;
  isManager: boolean;
  managerCategory?: "rector" | "vice-rector" | "director" | "head";
  order: number;
  seo: Seo;
}

export interface Money {
  amount: number;
  currency: "RUB";
  year?: number;
  form?: StudyForm;
}

export interface AdmissionExam {
  subject: string;
  minScore?: number;
  priority?: number;
  form?: "exam" | "olympiad" | "portfolio" | "interview";
}

export interface AdmissionInfo {
  exams: AdmissionExam[];
  minScores?: Record<string, number>;
  budgetPlaces?: number;
  paidPlaces?: number;
  tuition?: Money[];
  deadlines?: Array<{ label: string; date: ISODate }>;
}

export interface Program extends BaseEntity {
  code: string;
  name: string;
  level: ProgramLevel;
  profile?: string;
  facultyId: ID;
  departmentIds: ID[];
  forms: StudyForm[];
  duration?: string;
  languages: string[];
  budgetPlaces?: number;
  paidPlaces?: number;
  tuition: Money[];
  description: Block[];
  curriculumDocumentIds: ID[];
  annotationDocumentIds: ID[];
  admission?: AdmissionInfo;
  accreditation?: string;
  seo: Seo;
}

export interface AdmissionCampaign {
  id: ID;
  year: number;
  isCurrent: boolean;
  levels: Array<{
    level: AdmissionLevel;
    title: string;
    description: Block[];
    exams: AdmissionExam[];
    minScores?: Record<string, number>;
    places?: { budget?: number; paid?: number };
    tuition?: Money[];
    deadlines?: Array<{ label: string; date: ISODate }>;
    documentIds: ID[];
  }>;
  startDate?: ISODate;
  endDate?: ISODate;
  rulesDocumentId?: ID;
  documentIds: ID[];
  faq: FaqItem[];
  contactIds: ID[];
  status: Status;
}

export interface NewsCategory {
  id: ID;
  slug: string;
  title: string;
  order: number;
  seo: Seo;
}

export interface NewsTag {
  id: ID;
  slug: string;
  title: string;
}

export interface NewsArticle extends BaseEntity {
  title: string;
  summary: string;
  body: Block[];
  coverId?: ID;
  categoryIds: ID[];
  tagIds: ID[];
  audiences: Audience[];
  eventDate?: ISODateTime;
  location?: string;
  authorId?: ID;
  relatedIds: ID[];
  seo: Seo;
}

export interface Event extends BaseEntity {
  title: string;
  summary: string;
  body: Block[];
  startAt: ISODateTime;
  endAt?: ISODateTime;
  location?: string;
  category?: string;
  coverId?: ID;
  registrationUrl?: string;
  orgUnitIds: ID[];
  seo: Seo;
}

export interface DocumentCategory {
  id: ID;
  slug: string;
  title: string;
  parentId?: ID;
  order: number;
}

export interface Document extends BaseEntity {
  title: string;
  description?: string;
  mediaId: ID;
  categoryId: ID;
  sectionId?: ID;
  orgUnitId?: ID;
  programId?: ID;
  publishedAt?: ISODate;
  validFrom?: ISODate;
  validTo?: ISODate;
  version?: string;
  isMandatory: boolean;
  svedenItemprop?: string;
  seo: Seo;
}

export interface MediaAsset {
  id: ID;
  filename: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  url: string;
  alt: string;
  caption?: string;
  hash: string;
  createdAt: ISODateTime;
}

export interface Contact {
  id: ID;
  title: string;
  orgUnitId?: ID;
  address?: string;
  phones: string[];
  emails: string[];
  workingHours?: string;
  map?: GeoPoint;
  responsibleEmployeeId?: ID;
  order: number;
}

export interface PhoneEntry {
  id: ID;
  orgUnitId?: ID;
  title: string;
  phone: string;
  email?: string;
  address?: string;
  order: number;
  status: Status;
}

export interface FaqItem {
  id: ID;
  question: string;
  answer: Block[];
  category?: string;
  order: number;
  status: Status;
}

export interface Journal extends BaseEntity {
  title: string;
  issn?: string;
  description: Block[];
  editorialBoard: Array<{ employeeId?: ID; name: string; role?: string }>;
  rulesDocumentIds: ID[];
  ethicsDocumentIds: ID[];
  seo: Seo;
}

export interface JournalIssue {
  id: ID;
  journalId: ID;
  year: number;
  number: string;
  title?: string;
  coverId?: ID;
  pdfMediaId?: ID;
  publishedAt?: ISODate;
  articleIds: ID[];
  status: Status;
}

export interface Redirect {
  id: ID;
  from: string;
  to: string;
  status: 301 | 302 | 410;
  note?: string;
  createdAt: ISODateTime;
  hits: number;
}

export interface SvedenField {
  itemprop: string;
  label: string;
  value: string | string[];
  type: "text" | "link" | "table" | "list";
  required: boolean;
}

export interface SvedenTable {
  caption?: string;
  headers: string[];
  rows: string[][];
  itemprop?: string;
}

export interface SvedenData {
  section: string;
  itemtype?: string;
  fields: SvedenField[];
  tables: SvedenTable[];
}

export interface SvedenPage extends Page {
  template: "sveden";
  sveden: SvedenData;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface NavigationItem {
  id: string;
  title: string;
  path: string;
  children?: NavigationItem[];
  external?: boolean;
  visible: boolean;
  order: number;
}

export interface BreadcrumbItem {
  title: string;
  path: string;
}

export interface ExternalService {
  key: string;
  title: string;
  url: string;
  external: boolean;
  embed: boolean;
  embedKind?: "iframe" | "script" | "link";
  provider?: string;
  fallbackUrl?: string;
}

export interface SiteConfig {
  locale: Locale;
  siteUrl: string;
  siteName: string;
  shortName: string;
  defaultSeo: {
    titleTemplate: string;
    description: string;
    ogImage: string;
  };
  contacts: {
    address: string;
    phones: string[];
    emails: string[];
  };
  socialLinks: SocialLink[];
  quickLinks: NavigationItem[];
  externalServices: ExternalService[];
}

export interface NavigationConfig {
  main: NavigationItem[];
  utility: NavigationItem[];
  footer: NavigationItem[];
}

export interface RedirectEntry {
  from: string;
  to: string;
  status: 301 | 302;
}

export interface RedirectConfig {
  redirects: RedirectEntry[];
  gone: string[];
}

export interface SearchDocument {
  id: string;
  type: "page" | "news" | "program" | "employee" | "document" | "event" | "journal";
  locale: Locale;
  title: string;
  excerpt: string;
  url: string;
  section?: string;
  tags?: string[];
  date?: ISODate;
}

export interface ContentIndex {
  routes: string[];
  pages: Array<{ locale: Locale; path: string; title: string }>;
  translations: Array<{ ru: string; en?: string }>;
}

export interface ContentBundle {
  site: SiteConfig;
  navigation: NavigationConfig;
  pages: Page[];
  sections: Section[];
  university: UniversityInfo;
  news: NewsArticle[];
  programs: Program[];
  orgUnits: OrgUnit[];
  employees: Employee[];
  documents: Document[];
  journals: Journal[];
  events: Event[];
  contacts: Contact[];
  phonebook: PhoneEntry[];
  faq: FaqItem[];
  sveden: SvedenPage[];
  redirects: RedirectConfig;
  externalServices: ExternalService[];
}
