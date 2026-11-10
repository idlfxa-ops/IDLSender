/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GoogleTaskList {
  id: string;
  title: string;
  updated?: string;
  selfLink?: string;
}

export interface GoogleTaskItem {
  id: string;
  title: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string;
  completed?: string;
  deleted?: boolean;
  hidden?: boolean;
  updated?: string;
  position?: string;
}

const GOOGLE_TASKS_BASE_URL = 'https://tasks.googleapis.com/tasks/v1';

/**
 * Fetch all TaskLists for the authenticated user
 */
export async function fetchGoogleTaskLists(accessToken: string): Promise<GoogleTaskList[]> {
  try {
    const res = await fetch(`${GOOGLE_TASKS_BASE_URL}/users/@me/lists?maxResults=100`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error('Failed to fetch Google Task lists:', res.status, errBody);
      throw new Error(`Google Tasks API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching Google Task lists:', error);
    throw error;
  }
}

/**
 * Fetch tasks for a given taskListId
 */
export async function fetchGoogleTasks(
  accessToken: string,
  taskListId: string = '@default'
): Promise<GoogleTaskItem[]> {
  try {
    const res = await fetch(
      `${GOOGLE_TASKS_BASE_URL}/lists/${encodeURIComponent(taskListId)}/tasks?showCompleted=true&showHidden=true&maxResults=100`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!res.ok) {
      const errBody = await res.text();
      console.error('Failed to fetch Google tasks:', res.status, errBody);
      throw new Error(`Google Tasks API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return (data.items || []).filter((t: any) => !t.deleted);
  } catch (error) {
    console.error('Error fetching Google tasks:', error);
    throw error;
  }
}

/**
 * Create a new task in the specified Google TaskList
 */
export async function createGoogleTask(
  accessToken: string,
  taskListId: string = '@default',
  task: {
    title: string;
    notes?: string;
    due?: string; // RFC 3339 timestamp (e.g. "2026-11-15T00:00:00.000Z")
  }
): Promise<GoogleTaskItem> {
  try {
    const payload: any = {
      title: task.title,
    };
    if (task.notes) payload.notes = task.notes;
    if (task.due) {
      // Ensure ISO format with date
      payload.due = task.due.includes('T') ? task.due : `${task.due}T00:00:00.000Z`;
    }

    const res = await fetch(`${GOOGLE_TASKS_BASE_URL}/lists/${encodeURIComponent(taskListId)}/tasks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error('Failed to create Google task:', res.status, errBody);
      throw new Error(`Failed to create task in Google Tasks: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error creating Google task:', error);
    throw error;
  }
}

/**
 * Update an existing task (e.g. mark completed, change title/notes/due date)
 */
export async function updateGoogleTask(
  accessToken: string,
  taskListId: string = '@default',
  taskId: string,
  updates: Partial<{
    title: string;
    notes: string;
    status: 'needsAction' | 'completed';
    due: string;
  }>
): Promise<GoogleTaskItem> {
  try {
    const payload: any = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.notes !== undefined) payload.notes = updates.notes;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.due !== undefined) {
      payload.due = updates.due.includes('T') ? updates.due : `${updates.due}T00:00:00.000Z`;
    }

    const res = await fetch(
      `${GOOGLE_TASKS_BASE_URL}/lists/${encodeURIComponent(taskListId)}/tasks/${encodeURIComponent(taskId)}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const errBody = await res.text();
      console.error('Failed to update Google task:', res.status, errBody);
      throw new Error(`Failed to update task in Google Tasks: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error updating Google task:', error);
    throw error;
  }
}

/**
 * Delete a task in Google Tasks
 * Note: Workspace Skill requires explicit user confirmation before executing destructive calls!
 */
export async function deleteGoogleTask(
  accessToken: string,
  taskListId: string = '@default',
  taskId: string
): Promise<boolean> {
  try {
    const res = await fetch(
      `${GOOGLE_TASKS_BASE_URL}/lists/${encodeURIComponent(taskListId)}/tasks/${encodeURIComponent(taskId)}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!res.ok) {
      const errBody = await res.text();
      console.error('Failed to delete Google task:', res.status, errBody);
      throw new Error(`Failed to delete task from Google Tasks: ${res.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting Google task:', error);
    throw error;
  }
}

/**
 * Create a dedicated "IDLSender CRM Tasks" list if it doesn't already exist
 */
export async function ensureIdlSenderTaskList(accessToken: string): Promise<string> {
  try {
    const lists = await fetchGoogleTaskLists(accessToken);
    const existing = lists.find((l) => l.title === 'IDLSender CRM Tasks');
    if (existing) {
      return existing.id;
    }

    const res = await fetch(`${GOOGLE_TASKS_BASE_URL}/users/@me/lists`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'IDLSender CRM Tasks',
      }),
    });

    if (res.ok) {
      const created = await res.json();
      return created.id;
    }

    return '@default';
  } catch (error) {
    console.warn('Could not create dedicated list, falling back to @default:', error);
    return '@default';
  }
}
