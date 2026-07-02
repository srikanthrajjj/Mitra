import { ColdStartEntryChips } from '../../../ColdStartEntryChips';
import { DevShowcaseShell } from '../../shared/DevShowcaseShell';
import { ENTRY_CHIPS_CSS, ENTRY_CHIPS_HTML, ENTRY_CHIPS_REACT } from './snippets';
import { Theme } from '../../../../types';
import { cn } from '@/lib/utils';
import './entry-chips.css';

const CHIP_LABELS = ['New application', 'Industry template', 'Import Requirements', 'Improve What You Have'];

function VanillaEntryChipsPreview({ theme }: { theme: 'dark' | 'light' }) {
  const isDark = theme === 'dark';

  return (
    <div className="mitra-entry-chips">
      <p className="mitra-entry-chips__label">Choose an entry mode</p>
      <div className="mitra-entry-chips__row">
        {CHIP_LABELS.map((label) => (
          <button
            key={label}
            type="button"
            className={cn('mitra-entry-chip', isDark ? 'mitra-entry-chip--dark' : 'mitra-entry-chip--light')}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function EntryChipsShowcase({ theme }: { theme?: Theme }) {
  return (
    <DevShowcaseShell
      title="Entry Chips"
      description="Cold-start chips shown on the welcome screen so users pick how to begin: new app, template, import, or improve existing."
      notes={
        theme ? (
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Current app theme: <span className="font-mono text-foreground">{theme}</span>
            </li>
          </ul>
        ) : undefined
      }
      previews={[
        {
          label: 'Vanilla HTML + CSS',
          content: (previewTheme) => <VanillaEntryChipsPreview theme={previewTheme} />,
        },
        {
          label: 'React component (ColdStartEntryChips)',
          content: (previewTheme) => (
            <ColdStartEntryChips
              theme={previewTheme === 'dark' ? 'dark' : 'light'}
              onSelect={() => undefined}
            />
          ),
        },
      ]}
      snippets={{ html: ENTRY_CHIPS_HTML, css: ENTRY_CHIPS_CSS, react: ENTRY_CHIPS_REACT }}
    />
  );
}
