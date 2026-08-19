import stepperCss from './stepper.css?raw';

export const STEPPER_HTML = `<!-- Vertical workflow stepper -->
<ol class="mitra-stepper" aria-label="Progress steps">
  <li class="mitra-stepper__row">
    <div class="mitra-stepper__connector mitra-stepper__connector--complete"></div>
    <div class="mitra-stepper__node-slot">
      <div class="mitra-stepper__node mitra-stepper__node--complete">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true">
          <path d="M20 6 9 17l-5-5"/>
        </svg>
      </div>
    </div>
    <div class="mitra-stepper__content">
      <div class="mitra-stepper__meta">
        <span class="mitra-stepper__label mitra-stepper__label--complete">Business Owner</span>
        <span class="mitra-stepper__status mitra-stepper__status--complete">Complete</span>
      </div>
      <p class="mitra-stepper__description">Requirements captured and signed off.</p>
    </div>
  </li>
  <li class="mitra-stepper__row">
    <div class="mitra-stepper__connector"></div>
    <div class="mitra-stepper__node-slot">
      <div class="mitra-stepper__node mitra-stepper__node--active">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" style="animation: mitra-stepper-spin 1s linear infinite;">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
      </div>
    </div>
    <div class="mitra-stepper__content">
      <div class="mitra-stepper__meta">
        <span class="mitra-stepper__label mitra-stepper__label--active">Architect</span>
        <span class="mitra-stepper__status mitra-stepper__status--active">In progress</span>
      </div>
      <p class="mitra-stepper__description">Solution design and artifact generation underway.</p>
    </div>
  </li>
  <li class="mitra-stepper__row">
    <div class="mitra-stepper__connector"></div>
    <div class="mitra-stepper__node-slot">
      <div class="mitra-stepper__node mitra-stepper__node--blocked">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
        </svg>
      </div>
    </div>
    <div class="mitra-stepper__content">
      <div class="mitra-stepper__meta">
        <span class="mitra-stepper__label mitra-stepper__label--blocked">Security</span>
        <span class="mitra-stepper__status mitra-stepper__status--blocked">Blocked</span>
      </div>
      <p class="mitra-stepper__description">Waiting on ACL coverage review.</p>
    </div>
  </li>
  <li class="mitra-stepper__row">
    <div class="mitra-stepper__node-slot">
      <div class="mitra-stepper__node mitra-stepper__node--pending"></div>
    </div>
    <div class="mitra-stepper__content">
      <div class="mitra-stepper__meta">
        <span class="mitra-stepper__label mitra-stepper__label--pending">Sponsor</span>
        <span class="mitra-stepper__status mitra-stepper__status--pending">Pending</span>
      </div>
      <p class="mitra-stepper__description">Executive sign-off, not yet started.</p>
    </div>
  </li>
</ol>

<!-- Horizontal compact stepper -->
<div class="mitra-stepper-dots">
  <p class="mitra-stepper-dots__label">Step 2 of 4</p>
  <div class="mitra-stepper-dots__track" role="progressbar" aria-valuenow="2" aria-valuemin="1" aria-valuemax="4">
    <span class="mitra-stepper-dots__node mitra-stepper-dots__node--done"></span>
    <span class="mitra-stepper-dots__node mitra-stepper-dots__node--active"></span>
    <span class="mitra-stepper-dots__node"></span>
    <span class="mitra-stepper-dots__node"></span>
  </div>
</div>

<style>
@keyframes mitra-stepper-spin {
  to { transform: rotate(360deg); }
}
</style>`;

export const STEPPER_CSS = stepperCss;

export const STEPPER_REACT = `import { WorkflowStepper, DotStepper } from './components/MitraStepper';

<WorkflowStepper
  isDark
  steps={[
    { id: 'business_owner', label: 'Business Owner', status: 'complete', description: 'Requirements captured and signed off.' },
    { id: 'architect', label: 'Architect', status: 'active', description: 'Solution design and artifact generation underway.' },
    { id: 'security', label: 'Security', status: 'blocked', description: 'Waiting on ACL coverage review.' },
    { id: 'sponsor', label: 'Sponsor', status: 'pending', description: 'Executive sign-off, not yet started.' },
  ]}
/>

<DotStepper totalSteps={4} currentIndex={1} isDark />`;
