import entryChipsCss from './entry-chips.css?raw';

export const ENTRY_CHIPS_HTML = `<!-- Cold-start entry chips -->
<div class="mitra-entry-chips">
  <p class="mitra-entry-chips__label">Choose an entry mode</p>
  <div class="mitra-entry-chips__row">
    <button type="button" class="mitra-entry-chip mitra-entry-chip--light">New application</button>
    <button type="button" class="mitra-entry-chip mitra-entry-chip--light">Industry template</button>
    <button type="button" class="mitra-entry-chip mitra-entry-chip--light">Import Requirements</button>
    <button type="button" class="mitra-entry-chip mitra-entry-chip--light">Improve What You Have</button>
  </div>
</div>`;

export const ENTRY_CHIPS_CSS = entryChipsCss;

export const ENTRY_CHIPS_REACT = `import { ColdStartEntryChips } from './components/ColdStartEntryChips';

<ColdStartEntryChips
  theme={theme}
  onSelect={(prompt) => onSendMessage(prompt)}
  onTemplateNavigate={() => setActiveTab('templates')}
/>`;
