import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock, MessageSquare, Shield } from 'lucide-react';
import { StakeholderReview } from '../types';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Separator } from '@/src/components/ui/separator';
import { Input } from '@/src/components/ui/input';
import { cn } from '@/lib/utils';

interface SecurityReviewViewProps {
  review: StakeholderReview;
  onApprove?: (reviewId: string, comments?: string) => void;
  onRequestChanges?: (reviewId: string, comments?: string) => void;
}

const ROLE_MATRIX_SECTIONS = [
  { role: 'hr_agent', create: true, read: true, update: true, delete: false },
  { role: 'hr_manager', create: true, read: true, update: true, delete: false },
  { role: 'employee', create: true, read: 'own', update: false, delete: false },
  { role: 'it_support', create: false, read: false, update: false, delete: false },
];

export function SecurityReviewView({ review, onApprove, onRequestChanges }: SecurityReviewViewProps) {
  const isPending = review.status === 'awaiting';
  const isApproved = review.status === 'approved';
  const [justification, setJustification] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const handleReject = () => {
    if (!justification.trim()) return;
    onRequestChanges?.(review.id, justification.trim());
    setShowRejectForm(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10">
      <div className="mx-auto max-w-2xl space-y-8">
        <div
          className={cn(
            'flex items-center gap-3 rounded-xl border px-4 py-3',
            isPending
              ? 'border-amber-500/25 bg-amber-500/[0.07]'
              : isApproved
                ? 'border-emerald-500/20 bg-emerald-500/[0.05]'
                : 'border-border/60 bg-muted/20',
          )}
        >
          {isPending ? (
            <Shield className="h-5 w-5 shrink-0 text-amber-400" />
          ) : isApproved ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          ) : (
            <MessageSquare className="h-5 w-5 shrink-0 text-muted-foreground" />
          )}
          <div>
            <p className="text-sm font-medium text-foreground">
              {isPending
                ? 'Security sign-off required'
                : isApproved
                  ? 'Role matrix approved'
                  : 'Changes requested'}
            </p>
            <p className="text-xs text-muted-foreground">
              {isPending
                ? 'Validate ACLs and confidential-case restrictions before approve.'
                : review.completedLabel}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">{review.solutionTitle}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{review.artifactName}</h1>
        </div>

        <Separator />

        {isPending ? (
          <>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Review role-based access for HR confidential cases. Rejections require a written
              justification for the architect.
            </p>

            <Card className="overflow-hidden border-border/60 shadow-none">
              <CardHeader className="border-b border-border/40 bg-muted/15 pb-4">
                <CardTitle className="text-base font-medium">ACL role matrix</CardTitle>
                <CardDescription className="text-xs">
                  Field-level security · confidential case visibility
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/40 text-muted-foreground">
                        <th className="pb-2 pr-4 font-medium">Role</th>
                        <th className="pb-2 pr-2 font-medium">C</th>
                        <th className="pb-2 pr-2 font-medium">R</th>
                        <th className="pb-2 pr-2 font-medium">U</th>
                        <th className="pb-2 font-medium">D</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ROLE_MATRIX_SECTIONS.map((row) => (
                        <tr key={row.role} className="border-b border-border/20">
                          <td className="py-2 pr-4 font-mono text-foreground">{row.role}</td>
                          <td className="py-2 pr-2">{row.create ? '✓' : '—'}</td>
                          <td className="py-2 pr-2">{String(row.read)}</td>
                          <td className="py-2 pr-2">{row.update ? '✓' : '—'}</td>
                          <td className="py-2">{row.delete ? '✓' : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {review.summaryText && (
                  <p className="mt-4 whitespace-pre-line text-sm text-muted-foreground">
                    {review.summaryText}
                  </p>
                )}
              </CardContent>
            </Card>

            {!showRejectForm ? (
              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  className="h-10 min-h-[40px] min-w-[140px] text-sm"
                  onClick={() => onApprove?.(review.id, 'ACL matrix validated — confidential cases restricted.')}
                >
                  Approve
                </Button>
                <Button
                  variant="outline"
                  className="h-10 min-h-[40px] min-w-[140px] text-sm"
                  onClick={() => setShowRejectForm(true)}
                >
                  Reject
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border border-rose-500/25 bg-rose-500/5 p-4">
                <p className="flex items-center gap-1.5 text-xs font-medium text-rose-400">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Rejection justification (required)
                </p>
                <Input
                  className="mt-2"
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Describe ACL gaps or policy violations…"
                />
                <div className="mt-3 flex gap-2">
                  <Button size="sm" disabled={!justification.trim()} onClick={handleReject}>
                    Submit rejection
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowRejectForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <Card className="border-border/60 shadow-none">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Review closed</CardTitle>
              <CardDescription>{review.completedLabel}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                No further action needed. Your architect has been notified.
              </p>
              {review.stakeholderComments && (
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Notes:</span> {review.stakeholderComments}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
