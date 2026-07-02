import { MitraTodos } from '../../../MitraTodos';
import { HR_BUILD_TODOS } from '../../../../utils/buildTodos';
import { DevShowcaseShell } from '../../shared/DevShowcaseShell';
import { TODO_CARD_CSS, TODO_CARD_HTML, TODO_CARD_REACT } from './snippets';
import { cn } from '@/lib/utils';
import './todo-card.css';

function VanillaTodoPreview({ theme }: { theme: 'dark' | 'light' }) {
  const isDark = theme === 'dark';

  return (
    <div className={cn('mitra-todos-card w-full max-w-md', isDark ? '' : 'mitra-todos-card--light')}>
      <div className={cn('mitra-todos', !isDark && 'mitra-todos--light')} role="list" aria-label="To-dos">
        <p className="mitra-todos__summary">
          I&apos;ll build your HR onboarding tracker: HRSD scope, catalog workflows, SLA timers, and stakeholder-ready artifacts.
        </p>
        <div className="mitra-todos__header">
          <span className="mitra-todos__title">To-dos</span>
          <span className="mitra-todos__count">4</span>
        </div>
        <ul className="mitra-todos__list">
          <li className="mitra-todos__item mitra-todos__item--complete">
            <span className="mitra-todos__label">Parse HR onboarding scope and map HRSD modules</span>
          </li>
          <li className="mitra-todos__item mitra-todos__item--active">
            <span className="mitra-todos__label">Draft user stories and catalog item structure</span>
          </li>
          <li className="mitra-todos__item">
            <span className="mitra-todos__label">Configure approval workflow and Flow Designer SLA timers</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export function TodoCardShowcase() {
  return (
    <DevShowcaseShell
      title="Todo Card"
      description="Checklist card rendered inside assistant messages while Mitra builds a solution. Uses mitra-todos classes from the live app."
      notes={
        <ul className="list-disc space-y-2 pl-5">
          <li>Always pass <code className="rounded bg-muted px-1 font-mono text-xs">isDark</code> correctly — light mode needs <code className="rounded bg-muted px-1 font-mono text-xs">mitra-todos--light</code>.</li>
          <li>Wrap in a bordered card: <code className="rounded bg-muted px-1 font-mono text-xs">rounded-xl border p-3</code>.</li>
        </ul>
      }
      previews={[
        {
          label: 'Vanilla HTML + CSS',
          content: (theme) => <VanillaTodoPreview theme={theme} />,
        },
        {
          label: 'React component (MitraTodos)',
          content: (theme) => (
            <div
              className={cn(
                'w-full max-w-md rounded-xl border p-3',
                theme === 'dark' ? 'border-white/[0.08] bg-slate-950/50' : 'border-slate-200 bg-white shadow-sm',
              )}
            >
              <MitraTodos
                items={HR_BUILD_TODOS.slice(0, 4)}
                summary="I'll build your HR onboarding tracker: HRSD scope, catalog workflows, SLA timers, and stakeholder-ready artifacts."
                isDark={theme === 'dark'}
              />
            </div>
          ),
        },
      ]}
      snippets={{ html: TODO_CARD_HTML, css: TODO_CARD_CSS, react: TODO_CARD_REACT }}
    />
  );
}
