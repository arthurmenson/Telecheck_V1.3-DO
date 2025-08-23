import * as schedule from 'node-schedule';
import { MessagingService } from './messagingService';
import { AuditLogger } from './auditLogger';
import { db as database } from '../utils/databaseAdapter';

export interface ScheduledMessage {
  id: string;
  patientId: string;
  type: 'medication_reminder' | 'glucose_check' | 'appointment_reminder' | 'daily_update' | 'care_team_alert' | 'wellness_check';
  message: string;
  scheduledTime: Date;
  timezone: string;
  phone: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  retryCount: number;
  maxRetries: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  sentAt?: Date;
  errorMessage?: string;
}

export interface PatientSchedule {
  patientId: string;
  medications: Array<{
    name: string;
    dosage: string;
    times: string[]; // ['08:00', '20:00']
    instructions?: string;
  }>;
  glucoseChecks: string[]; // ['07:00', '11:30', '17:00', '21:00']
  appointments: Array<{
    id: string;
    dateTime: Date;
    provider: string;
    type: string;
    location?: string;
  }>;
  careTeamUpdates: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string; // '09:00'
    dayOfWeek?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
  };
  quietHours: {
    start: string; // '22:00'
    end: string; // '07:00'
  };
  timezone: string;
  phone: string;
  preferences: {
    medicationReminders: boolean;
    glucoseReminders: boolean;
    appointmentReminders: boolean;
    careTeamUpdates: boolean;
    preferredChannel: 'sms' | 'voice' | 'both';
  };
}

export interface MessageTemplate {
  type: string;
  content: string;
  variables: string[];
}

export class ScheduledMessagingService {
  private messagingService: MessagingService;
  private activeJobs: Map<string, schedule.Job> = new Map();
  private messageTemplates: Map<string, MessageTemplate> = new Map();

  constructor() {
    this.messagingService = new MessagingService();
    this.initializeTemplates();
    this.loadActiveSchedules();
  }

  private initializeTemplates(): void {
    this.messageTemplates.set('medication_reminder', {
      type: 'medication_reminder',
      content: 'Reminder: It\'s time to take your {{medication}} ({{dosage}}). {{instructions}}',
      variables: ['medication', 'dosage', 'instructions']
    });

    this.messageTemplates.set('glucose_check', {
      type: 'glucose_check',
      content: 'Time for your glucose check! Please test your blood sugar and log the results in your patient portal.',
      variables: []
    });

    this.messageTemplates.set('appointment_reminder_24h', {
      type: 'appointment_reminder',
      content: 'Reminder: You have an appointment with {{provider}} tomorrow at {{time}}. Location: {{location}}. Please arrive 15 minutes early.',
      variables: ['provider', 'time', 'location']
    });

    this.messageTemplates.set('appointment_reminder_2h', {
      type: 'appointment_reminder',
      content: 'Your appointment with {{provider}} is in 2 hours at {{time}}. Location: {{location}}. Don\'t forget to bring your insurance card and medication list.',
      variables: ['provider', 'time', 'location']
    });

    this.messageTemplates.set('daily_update', {
      type: 'daily_update',
      content: 'Good morning! Please remember to:\n- Take your medications\n- Check your glucose levels\n- Log your meals and activities\n- Contact us with any concerns: {{contact_number}}',
      variables: ['contact_number']
    });

    this.messageTemplates.set('care_team_alert', {
      type: 'care_team_alert',
      content: 'Patient {{patient_name}} (ID: {{patient_id}}) requires attention: {{alert_reason}}. Last reading: {{last_reading}}. Please review and respond.',
      variables: ['patient_name', 'patient_id', 'alert_reason', 'last_reading']
    });

    this.messageTemplates.set('wellness_check', {
      type: 'wellness_check',
      content: 'Hi {{patient_name}}, how are you feeling today? Reply with a number 1-10 (1=very poor, 10=excellent) to rate your overall wellness.',
      variables: ['patient_name']
    });
  }

  async schedulePatientMessages(patientSchedule: PatientSchedule): Promise<void> {
    try {
      AuditLogger.log('SYSTEM', 'scheduled_messaging', `Scheduling messages for patient ${patientSchedule.patientId}`, {
        patientId: patientSchedule.patientId,
        preferences: patientSchedule.preferences
      });

      // Cancel existing schedules for this patient
      await this.cancelPatientSchedules(patientSchedule.patientId);

      // Schedule medication reminders
      if (patientSchedule.preferences.medicationReminders) {
        for (const medication of patientSchedule.medications) {
          for (const time of medication.times) {
            await this.scheduleMedicationReminder(patientSchedule, medication, time);
          }
        }
      }

      // Schedule glucose check reminders
      if (patientSchedule.preferences.glucoseReminders) {
        for (const time of patientSchedule.glucoseChecks) {
          await this.scheduleGlucoseReminder(patientSchedule, time);
        }
      }

      // Schedule appointment reminders
      if (patientSchedule.preferences.appointmentReminders) {
        for (const appointment of patientSchedule.appointments) {
          await this.scheduleAppointmentReminders(patientSchedule, appointment);
        }
      }

      // Schedule care team updates
      if (patientSchedule.preferences.careTeamUpdates) {
        await this.scheduleCareTeamUpdates(patientSchedule);
      }

      // Save schedule to database
      await this.savePatientSchedule(patientSchedule);

    } catch (error) {
      console.error('Error scheduling patient messages:', error);
      AuditLogger.log('SYSTEM', 'scheduled_messaging_error', `Failed to schedule messages for patient ${patientSchedule.patientId}`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        patientId: patientSchedule.patientId
      });
      throw error;
    }
  }

  private async scheduleMedicationReminder(
    patientSchedule: PatientSchedule, 
    medication: any, 
    time: string
  ): Promise<void> {
    const jobName = `med_${patientSchedule.patientId}_${medication.name}_${time}`;
    const cronExpression = this.timeToCron(time, patientSchedule.timezone);

    const job = schedule.scheduleJob(jobName, cronExpression, async () => {
      if (this.isQuietHours(time, patientSchedule.quietHours)) {
        console.log(`Skipping medication reminder during quiet hours: ${jobName}`);
        return;
      }

      const template = this.messageTemplates.get('medication_reminder')!;
      const message = this.interpolateTemplate(template.content, {
        medication: medication.name,
        dosage: medication.dosage,
        instructions: medication.instructions || 'Take as prescribed'
      });

      await this.sendScheduledMessage({
        id: `${jobName}_${Date.now()}`,
        patientId: patientSchedule.patientId,
        type: 'medication_reminder',
        message,
        scheduledTime: new Date(),
        timezone: patientSchedule.timezone,
        phone: patientSchedule.phone,
        status: 'pending',
        retryCount: 0,
        maxRetries: 3,
        metadata: { medication: medication.name, dosage: medication.dosage },
        createdAt: new Date()
      });
    });

    this.activeJobs.set(jobName, job);
  }

  private async scheduleGlucoseReminder(patientSchedule: PatientSchedule, time: string): Promise<void> {
    const jobName = `glucose_${patientSchedule.patientId}_${time}`;
    const cronExpression = this.timeToCron(time, patientSchedule.timezone);

    const job = schedule.scheduleJob(jobName, cronExpression, async () => {
      if (this.isQuietHours(time, patientSchedule.quietHours)) {
        console.log(`Skipping glucose reminder during quiet hours: ${jobName}`);
        return;
      }

      const template = this.messageTemplates.get('glucose_check')!;
      const message = template.content;

      await this.sendScheduledMessage({
        id: `${jobName}_${Date.now()}`,
        patientId: patientSchedule.patientId,
        type: 'glucose_check',
        message,
        scheduledTime: new Date(),
        timezone: patientSchedule.timezone,
        phone: patientSchedule.phone,
        status: 'pending',
        retryCount: 0,
        maxRetries: 3,
        metadata: { checkTime: time },
        createdAt: new Date()
      });
    });

    this.activeJobs.set(jobName, job);
  }

  private async scheduleAppointmentReminders(
    patientSchedule: PatientSchedule, 
    appointment: any
  ): Promise<void> {
    const appointmentDate = new Date(appointment.dateTime);
    
    // 24-hour reminder
    const reminder24h = new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000);
    const jobName24h = `appt_24h_${patientSchedule.patientId}_${appointment.id}`;
    
    if (reminder24h > new Date()) {
      const job24h = schedule.scheduleJob(jobName24h, reminder24h, async () => {
        const template = this.messageTemplates.get('appointment_reminder_24h')!;
        const message = this.interpolateTemplate(template.content, {
          provider: appointment.provider,
          time: appointmentDate.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            timeZone: patientSchedule.timezone 
          }),
          location: appointment.location || 'See appointment details'
        });

        await this.sendScheduledMessage({
          id: `${jobName24h}_${Date.now()}`,
          patientId: patientSchedule.patientId,
          type: 'appointment_reminder',
          message,
          scheduledTime: reminder24h,
          timezone: patientSchedule.timezone,
          phone: patientSchedule.phone,
          status: 'pending',
          retryCount: 0,
          maxRetries: 2,
          metadata: { appointmentId: appointment.id, reminderType: '24h' },
          createdAt: new Date()
        });
      });

      this.activeJobs.set(jobName24h, job24h);
    }

    // 2-hour reminder
    const reminder2h = new Date(appointmentDate.getTime() - 2 * 60 * 60 * 1000);
    const jobName2h = `appt_2h_${patientSchedule.patientId}_${appointment.id}`;
    
    if (reminder2h > new Date()) {
      const job2h = schedule.scheduleJob(jobName2h, reminder2h, async () => {
        const template = this.messageTemplates.get('appointment_reminder_2h')!;
        const message = this.interpolateTemplate(template.content, {
          provider: appointment.provider,
          time: appointmentDate.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            timeZone: patientSchedule.timezone 
          }),
          location: appointment.location || 'See appointment details'
        });

        await this.sendScheduledMessage({
          id: `${jobName2h}_${Date.now()}`,
          patientId: patientSchedule.patientId,
          type: 'appointment_reminder',
          message,
          scheduledTime: reminder2h,
          timezone: patientSchedule.timezone,
          phone: patientSchedule.phone,
          status: 'pending',
          retryCount: 0,
          maxRetries: 2,
          metadata: { appointmentId: appointment.id, reminderType: '2h' },
          createdAt: new Date()
        });
      });

      this.activeJobs.set(jobName2h, job2h);
    }
  }

  private async scheduleCareTeamUpdates(patientSchedule: PatientSchedule): Promise<void> {
    const { careTeamUpdates } = patientSchedule;
    const jobName = `care_update_${patientSchedule.patientId}`;

    let cronExpression: string;
    
    switch (careTeamUpdates.frequency) {
      case 'daily':
        cronExpression = this.timeToCron(careTeamUpdates.time, patientSchedule.timezone);
        break;
      case 'weekly':
        const dayOfWeek = careTeamUpdates.dayOfWeek || 1; // Default Monday
        const [hour, minute] = careTeamUpdates.time.split(':');
        cronExpression = `${minute} ${hour} * * ${dayOfWeek}`;
        break;
      case 'monthly':
        const dayOfMonth = careTeamUpdates.dayOfMonth || 1;
        const [monthHour, monthMinute] = careTeamUpdates.time.split(':');
        cronExpression = `${monthMinute} ${monthHour} ${dayOfMonth} * *`;
        break;
      default:
        throw new Error(`Unsupported care team update frequency: ${careTeamUpdates.frequency}`);
    }

    const job = schedule.scheduleJob(jobName, cronExpression, async () => {
      const template = this.messageTemplates.get('daily_update')!;
      const message = this.interpolateTemplate(template.content, {
        contact_number: '+1-800-CARE-TEAM' // This should come from configuration
      });

      await this.sendScheduledMessage({
        id: `${jobName}_${Date.now()}`,
        patientId: patientSchedule.patientId,
        type: 'daily_update',
        message,
        scheduledTime: new Date(),
        timezone: patientSchedule.timezone,
        phone: patientSchedule.phone,
        status: 'pending',
        retryCount: 0,
        maxRetries: 2,
        metadata: { frequency: careTeamUpdates.frequency },
        createdAt: new Date()
      });
    });

    this.activeJobs.set(jobName, job);
  }

  private async sendScheduledMessage(scheduledMessage: ScheduledMessage): Promise<void> {
    try {
      console.log(`Sending scheduled message: ${scheduledMessage.type} to ${scheduledMessage.phone}`);
      
      const result = await this.messagingService.sendMessage({
        to: scheduledMessage.phone,
        message: scheduledMessage.message,
        type: 'sms',
        metadata: {
          scheduledMessageId: scheduledMessage.id,
          patientId: scheduledMessage.patientId,
          messageType: scheduledMessage.type,
          ...scheduledMessage.metadata
        }
      });

      if (result.success) {
        scheduledMessage.status = 'sent';
        scheduledMessage.sentAt = new Date();
        
        AuditLogger.logCommunication(
          scheduledMessage.patientId,
          'sms',
          'outbound',
          {
            messageId: result.messageId,
            messageType: scheduledMessage.type,
            scheduledTime: scheduledMessage.scheduledTime,
            actualSentTime: scheduledMessage.sentAt
          }
        );
      } else {
        throw new Error(result.error || 'Failed to send message');
      }

    } catch (error) {
      console.error(`Failed to send scheduled message ${scheduledMessage.id}:`, error);
      
      scheduledMessage.retryCount++;
      scheduledMessage.errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (scheduledMessage.retryCount < scheduledMessage.maxRetries) {
        // Schedule retry in 5 minutes
        setTimeout(() => {
          this.sendScheduledMessage(scheduledMessage);
        }, 5 * 60 * 1000);
      } else {
        scheduledMessage.status = 'failed';
        AuditLogger.log('SYSTEM', 'scheduled_message_failed', `Scheduled message failed after ${scheduledMessage.maxRetries} retries`, {
          scheduledMessageId: scheduledMessage.id,
          patientId: scheduledMessage.patientId,
          error: scheduledMessage.errorMessage
        });
      }
    }

    // Update message status in database
    await this.updateScheduledMessageStatus(scheduledMessage);
  }

  async cancelPatientSchedules(patientId: string): Promise<void> {
    const jobsToCancel: string[] = [];
    
    for (const [jobName, job] of this.activeJobs) {
      if (jobName.includes(patientId)) {
        job.cancel();
        jobsToCancel.push(jobName);
      }
    }

    jobsToCancel.forEach(jobName => {
      this.activeJobs.delete(jobName);
    });

    console.log(`Cancelled ${jobsToCancel.length} scheduled jobs for patient ${patientId}`);
    
    AuditLogger.log('SYSTEM', 'scheduled_messaging', `Cancelled scheduled messages for patient ${patientId}`, {
      patientId,
      cancelledJobs: jobsToCancel.length
    });
  }

  async sendWellnessCheck(patientId: string, patientName: string, phone: string): Promise<boolean> {
    try {
      const template = this.messageTemplates.get('wellness_check')!;
      const message = this.interpolateTemplate(template.content, {
        patient_name: patientName
      });

      const result = await this.messagingService.sendMessage({
        to: phone,
        message,
        type: 'sms',
        metadata: {
          patientId,
          messageType: 'wellness_check',
          expectsResponse: true
        }
      });

      if (result.success) {
        AuditLogger.logCommunication(patientId, 'sms', 'outbound', {
          messageId: result.messageId,
          messageType: 'wellness_check',
          expectsResponse: true
        });
        return true;
      } else {
        console.error(`Failed to send wellness check to ${phone}:`, result.error);
        return false;
      }
    } catch (error) {
      console.error(`Error sending wellness check to patient ${patientId}:`, error);
      return false;
    }
  }

  async getScheduledMessages(patientId?: string, status?: string): Promise<ScheduledMessage[]> {
    try {
      let query = 'SELECT * FROM scheduled_messages WHERE 1=1';
      const params: any[] = [];

      if (patientId) {
        query += ' AND patient_id = ?';
        params.push(patientId);
      }

      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }

      query += ' ORDER BY scheduled_time DESC';

      const messages = await database.query(query, params);
      return messages || [];
    } catch (error) {
      console.error('Error fetching scheduled messages:', error);
      return [];
    }
  }

  private timeToCron(time: string, timezone: string): string {
    const [hour, minute] = time.split(':');
    return `${minute} ${hour} * * *`; // Daily at specified time
  }

  private isQuietHours(time: string, quietHours: { start: string; end: string }): boolean {
    const currentTime = time;
    const { start, end } = quietHours;
    
    // Simple time comparison (assumes same day)
    if (start < end) {
      return currentTime >= start && currentTime <= end;
    } else {
      // Quiet hours span midnight
      return currentTime >= start || currentTime <= end;
    }
  }

  private interpolateTemplate(template: string, variables: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return result;
  }

  private async savePatientSchedule(schedule: PatientSchedule): Promise<void> {
    try {
      const query = `
        INSERT OR REPLACE INTO patient_schedules 
        (patient_id, schedule_data, created_at, updated_at)
        VALUES (?, ?, datetime('now'), datetime('now'))
      `;
      
      await database.query(query, [
        schedule.patientId,
        JSON.stringify(schedule)
      ]);
    } catch (error) {
      console.error('Error saving patient schedule:', error);
      throw error;
    }
  }

  private async updateScheduledMessageStatus(message: ScheduledMessage): Promise<void> {
    try {
      const query = `
        INSERT OR REPLACE INTO scheduled_messages 
        (id, patient_id, type, message, scheduled_time, timezone, phone, status, retry_count, max_retries, metadata, created_at, sent_at, error_message)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      await database.query(query, [
        message.id,
        message.patientId,
        message.type,
        message.message,
        message.scheduledTime.toISOString(),
        message.timezone,
        message.phone,
        message.status,
        message.retryCount,
        message.maxRetries,
        JSON.stringify(message.metadata || {}),
        message.createdAt.toISOString(),
        message.sentAt?.toISOString() || null,
        message.errorMessage || null
      ]);
    } catch (error) {
      console.error('Error updating scheduled message status:', error);
      throw error;
    }
  }

  private async loadActiveSchedules(): Promise<void> {
    try {
      console.log('Loading active patient schedules...');
      
      const schedules = await database.query(
        'SELECT * FROM patient_schedules WHERE active = 1'
      );

      if (schedules && schedules.length > 0) {
        for (const scheduleRow of schedules) {
          try {
            const schedule: PatientSchedule = JSON.parse(scheduleRow.schedule_data);
            await this.schedulePatientMessages(schedule);
          } catch (error) {
            console.error(`Error loading schedule for patient ${scheduleRow.patient_id}:`, error);
          }
        }
        console.log(`Loaded ${schedules.length} active patient schedules`);
      } else {
        console.log('No active patient schedules found');
      }
    } catch (error) {
      console.error('Error loading active schedules:', error);
    }
  }

  async getPatientSchedule(patientId: string): Promise<PatientSchedule | null> {
    try {
      const result = await database.query(
        'SELECT schedule_data FROM patient_schedules WHERE patient_id = ? AND active = 1',
        [patientId]
      );

      if (result && result.length > 0) {
        return JSON.parse(result[0].schedule_data);
      }
      return null;
    } catch (error) {
      console.error(`Error fetching schedule for patient ${patientId}:`, error);
      return null;
    }
  }

  async updatePatientSchedule(patientSchedule: PatientSchedule): Promise<void> {
    await this.schedulePatientMessages(patientSchedule);
  }

  async pausePatientSchedule(patientId: string): Promise<void> {
    await this.cancelPatientSchedules(patientId);
    
    try {
      await database.query(
        'UPDATE patient_schedules SET active = 0 WHERE patient_id = ?',
        [patientId]
      );
      
      AuditLogger.log('SYSTEM', 'scheduled_messaging', `Paused schedule for patient ${patientId}`, {
        patientId
      });
    } catch (error) {
      console.error(`Error pausing schedule for patient ${patientId}:`, error);
      throw error;
    }
  }

  async resumePatientSchedule(patientId: string): Promise<void> {
    try {
      await database.query(
        'UPDATE patient_schedules SET active = 1 WHERE patient_id = ?',
        [patientId]
      );

      const schedule = await this.getPatientSchedule(patientId);
      if (schedule) {
        await this.schedulePatientMessages(schedule);
        
        AuditLogger.log('SYSTEM', 'scheduled_messaging', `Resumed schedule for patient ${patientId}`, {
          patientId
        });
      }
    } catch (error) {
      console.error(`Error resuming schedule for patient ${patientId}:`, error);
      throw error;
    }
  }

  getActiveJobsCount(): number {
    return this.activeJobs.size;
  }

  getActiveJobsForPatient(patientId: string): string[] {
    const patientJobs: string[] = [];
    for (const jobName of this.activeJobs.keys()) {
      if (jobName.includes(patientId)) {
        patientJobs.push(jobName);
      }
    }
    return patientJobs;
  }

  async getSchedulingStats(): Promise<{
    totalActiveJobs: number;
    messagesSentToday: number;
    messagesFailedToday: number;
    activePatients: number;
  }> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const [sentToday, failedToday, activePatients] = await Promise.all([
        database.query(
          "SELECT COUNT(*) as count FROM scheduled_messages WHERE status = 'sent' AND date(sent_at) = ?",
          [today]
        ),
        database.query(
          "SELECT COUNT(*) as count FROM scheduled_messages WHERE status = 'failed' AND date(created_at) = ?",
          [today]
        ),
        database.query(
          "SELECT COUNT(DISTINCT patient_id) as count FROM patient_schedules WHERE active = 1"
        )
      ]);

      return {
        totalActiveJobs: this.activeJobs.size,
        messagesSentToday: sentToday?.[0]?.count || 0,
        messagesFailedToday: failedToday?.[0]?.count || 0,
        activePatients: activePatients?.[0]?.count || 0
      };
    } catch (error) {
      console.error('Error fetching scheduling stats:', error);
      return {
        totalActiveJobs: this.activeJobs.size,
        messagesSentToday: 0,
        messagesFailedToday: 0,
        activePatients: 0
      };
    }
  }
}

export const scheduledMessagingService = new ScheduledMessagingService();
