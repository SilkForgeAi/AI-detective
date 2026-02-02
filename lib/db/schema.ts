// Database schema using Drizzle ORM
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const cases = sqliteTable('cases', {
  id: text('id').primaryKey(),
  userId: text('user_id'), // User who created the case
  title: text('title').notNull(),
  date: text('date').notNull(),
  status: text('status').notNull(), // 'open' | 'analyzing' | 'solved' | 'cold' | 'closed'
  description: text('description').notNull(),
  jurisdiction: text('jurisdiction'),
  caseNumber: text('case_number'),
  assignedOfficer: text('assigned_officer'),
  priority: text('priority').notNull().default('medium'),
  tags: text('tags'), // JSON array
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  privacyFlags: text('privacy_flags'), // JSON object
})

export const evidence = sqliteTable('evidence', {
  id: text('id').primaryKey(),
  caseId: text('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  description: text('description').notNull(),
  source: text('source'),
  date: text('date'),
  fileUrl: text('file_url'),
  metadata: text('metadata'), // JSON object
  confidence: real('confidence'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const analyses = sqliteTable('analyses', {
  id: text('id').primaryKey(),
  caseId: text('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  timestamp: text('timestamp').notNull(),
  insights: text('insights'), // JSON array
  hypotheses: text('hypotheses'), // JSON array
  patterns: text('patterns'), // JSON array
  anomalies: text('anomalies'), // JSON array
  timeline: text('timeline'), // JSON array
  locations: text('locations'), // JSON array
  confidenceScores: text('confidence_scores'), // JSON object
  recommendations: text('recommendations'), // JSON array
  sources: text('sources'), // JSON array
  auditTrail: text('audit_trail'), // JSON array
  reasoningChain: text('reasoning_chain'), // JSON object
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const caseComments = sqliteTable('case_comments', {
  id: text('id').primaryKey(),
  caseId: text('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  userName: text('user_name').notNull(),
  content: text('content').notNull(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const caseBookmarks = sqliteTable('case_bookmarks', {
  id: text('id').primaryKey(),
  caseId: text('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const savedSearches = sqliteTable('saved_searches', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  query: text('query'),
  filters: text('filters'), // JSON object
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const userNotifications = sqliteTable('user_notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'case_update', 'analysis_complete', 'pattern_match', etc.
  title: text('title').notNull(),
  message: text('message').notNull(),
  caseId: text('case_id').references(() => cases.id, { onDelete: 'cascade' }),
  read: integer('read', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const caseShares = sqliteTable('case_shares', {
  id: text('id').primaryKey(),
  caseId: text('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  sharedBy: text('shared_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sharedWith: text('shared_with').notNull().references(() => users.id, { onDelete: 'cascade' }),
  permission: text('permission').notNull().default('view'), // 'view', 'comment', 'edit'
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const activityLog = sqliteTable('activity_log', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  caseId: text('case_id').references(() => cases.id, { onDelete: 'cascade' }),
  action: text('action').notNull(), // 'case_created', 'case_updated', 'analysis_run', etc.
  description: text('description').notNull(),
  metadata: text('metadata'), // JSON object
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const passwordResetTokens = sqliteTable('password_reset_tokens', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: text('expires_at').notNull(),
  used: integer('used', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const emailVerifications = sqliteTable('email_verifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  email: text('email').notNull(),
  verified: integer('verified', { mode: 'boolean' }).notNull().default(false),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const feedback = sqliteTable('feedback', {
  id: text('id').primaryKey(),
  caseId: text('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  verified: integer('verified', { mode: 'boolean' }).notNull(),
  accuracy: integer('accuracy').notNull(),
  correctInsights: text('correct_insights'), // JSON array
  incorrectInsights: text('incorrect_insights'), // JSON array
  correctHypotheses: text('correct_hypotheses'), // JSON array
  incorrectHypotheses: text('incorrect_hypotheses'), // JSON array
  correctAnomalies: text('correct_anomalies'), // JSON array
  incorrectAnomalies: text('incorrect_anomalies'), // JSON array
  actualOutcome: text('actual_outcome'),
  solvedBy: text('solved_by'),
  notes: text('notes'),
  verifiedBy: text('verified_by'),
  verifiedAt: text('verified_at').notNull(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  passwordHash: text('password_hash'),
  role: text('role').notNull().default('investigator'), // 'admin' | 'investigator' | 'viewer'
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  lastLogin: text('last_login'),
})

export const files = sqliteTable('files', {
  id: text('id').primaryKey(),
  caseId: text('case_id').references(() => cases.id, { onDelete: 'cascade' }),
  evidenceId: text('evidence_id').references(() => evidence.id, { onDelete: 'cascade' }),
  filename: text('filename').notNull(),
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  path: text('path').notNull(),
  extractedText: text('extracted_text'), // For OCR
  metadata: text('metadata'), // JSON object
  uploadedBy: text('uploaded_by').references(() => users.id),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})
