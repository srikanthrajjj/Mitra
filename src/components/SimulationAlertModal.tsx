import AlertDialog from './AlertDialog';
import { SIMULATION_BANNER } from '../constants/simulation';
import { Theme } from '../types';

interface SimulationAlertModalProps {
  theme: Theme;
  isOpen: boolean;
  onDismiss: () => void;
}

export default function SimulationAlertModal({
  theme,
  isOpen,
  onDismiss,
}: SimulationAlertModalProps) {
  return (
    <AlertDialog
      theme={theme}
      isOpen={isOpen}
      title="Demo mode"
      variant="warning"
      confirmLabel="Got it"
      cancelLabel="Close"
      message={
        <p>
          {SIMULATION_BANNER}
          <span className="block mt-3 text-[12px] opacity-75">
            For demo and planning only — not connected to a live ServiceNow instance.
          </span>
        </p>
      }
      onConfirm={onDismiss}
      onCancel={onDismiss}
    />
  );
}
