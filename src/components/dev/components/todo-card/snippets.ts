import todoCardCss from './todo-card.css?raw';

export const TODO_CARD_HTML = `<!-- Todo card (light) -->
<div class="mitra-todos-card mitra-todos-card--light">
  <div class="mitra-todos mitra-todos--light" role="list" aria-label="To-dos">
    <p class="mitra-todos__summary">
      I'll build your HR onboarding tracker: HRSD scope, catalog workflows, SLA timers, and stakeholder-ready artifacts.
    </p>
    <div class="mitra-todos__header">
      <svg class="mitra-todos__icon" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.75" aria-hidden="true">
        <path d="M13 5h8"/><path d="M13 12h8"/><path d="M13 19h8"/><path d="M3 5h.01"/><path d="M3 12h.01"/><path d="M3 19h.01"/>
      </svg>
      <span class="mitra-todos__title">To-dos</span>
      <span class="mitra-todos__count">4</span>
    </div>
    <ul class="mitra-todos__list">
      <li class="mitra-todos__item mitra-todos__item--complete">
        <svg class="mitra-todos__icon" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="1.75" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
        </svg>
        <span class="mitra-todos__label">Parse HR onboarding scope and map HRSD modules</span>
      </li>
      <li class="mitra-todos__item mitra-todos__item--active">
        <svg class="mitra-todos__icon" viewBox="0 0 24 24" fill="none" stroke="#334155" stroke-width="1.75" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="m16 12-4 4-4-4"/>
        </svg>
        <span class="mitra-todos__label">Draft user stories and catalog item structure</span>
      </li>
      <li class="mitra-todos__item">
        <svg class="mitra-todos__icon" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke-dasharray="3 3"/>
        </svg>
        <span class="mitra-todos__label">Configure approval workflow and Flow Designer SLA timers</span>
      </li>
    </ul>
  </div>
</div>`;

export const TODO_CARD_CSS = todoCardCss;

export const TODO_CARD_REACT = `import { MitraTodos } from './components/MitraTodos';
import { HR_BUILD_TODOS } from './utils/buildTodos';

<div className="mb-3 rounded-xl border p-3 border-slate-200 bg-white shadow-sm">
  <MitraTodos
    items={HR_BUILD_TODOS}
    summary="I'll build your HR onboarding tracker..."
    animate
    stepMs={850}
    isDark={false}
  />
</div>`;
