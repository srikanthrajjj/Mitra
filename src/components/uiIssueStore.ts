import { createClient } from '@supabase/supabase-js';

// Shared storage for the /ui issue tracker. The publishable key is meant to ship in browser code;
// what it can reach is limited by the grants and row-level security policies on ui_issues.
const SUPABASE_URL = 'https://lklvqtmgyjqvsioylymb.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_ElBApzkqN-fkBb9Npjrlbg_usWGBi58';

const ISSUES_TABLE = 'ui_issues';
const SCREENSHOT_BUCKET = 'ui-issue-screenshots';

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

export type IssueRecord = { id: string } & Record<string, unknown>;

export async function fetchIssueRecords(): Promise<IssueRecord[]> {
  const { data, error } = await supabase.from(ISSUES_TABLE).select('data');
  if (error) throw error;
  return (data ?? []).map((row) => row.data as IssueRecord);
}

export async function saveIssueRecords(records: IssueRecord[], options: { onlyMissing?: boolean } = {}) {
  if (records.length === 0) return;

  const rows = records.map((record) => ({ id: record.id, data: record, updated_at: new Date().toISOString() }));
  const { error } = await supabase
    .from(ISSUES_TABLE)
    .upsert(rows, { onConflict: 'id', ignoreDuplicates: options.onlyMissing ?? false });
  if (error) throw error;
}

export async function deleteIssueRecord(id: string) {
  const { error } = await supabase.from(ISSUES_TABLE).delete().eq('id', id);
  if (error) throw error;
}

export function subscribeToIssueRecords(handlers: {
  onSave: (record: IssueRecord) => void;
  onDelete: (id: string) => void;
}) {
  const channel = supabase
    .channel('ui-issues')
    .on('postgres_changes', { event: '*', schema: 'public', table: ISSUES_TABLE }, (payload) => {
      if (payload.eventType === 'DELETE') {
        const id = (payload.old as { id?: string }).id;
        if (id) handlers.onDelete(id);
        return;
      }
      const row = payload.new as { data?: IssueRecord };
      if (row.data) handlers.onSave(row.data);
    })
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

// Screenshots live in Storage so issue rows (and realtime messages) stay small.
export async function uploadScreenshot(issueId: string, dataUrl: string): Promise<string> {
  const blob = await (await fetch(dataUrl)).blob();
  const contentType = blob.type || 'image/jpeg';
  const extension = contentType === 'image/png' ? 'png' : 'jpg';
  const path = `${issueId}/${Date.now()}.${extension}`;

  const { error } = await supabase.storage.from(SCREENSHOT_BUCKET).upload(path, blob, { contentType });
  if (error) throw error;
  return supabase.storage.from(SCREENSHOT_BUCKET).getPublicUrl(path).data.publicUrl;
}
