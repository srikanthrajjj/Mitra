import { SolutionArtifact, RequirementsDocument, Theme } from '../types';
import { getSolutionTitle } from '../data/solutionArtifacts';
import { ArtifactDocumentPreview } from './ArtifactDocumentPreview';
import { RequirementsDocumentEditor } from './RequirementsDocumentEditor';

interface ArtifactViewProps {
  artifact: SolutionArtifact;
  requirementsDocument?: RequirementsDocument;
  onUpdateRequirementsSection?: (sectionId: string, body: string) => void;
  onShare?: (artifact: SolutionArtifact) => void;
  theme?: Theme;
}

export function ArtifactView({
  artifact,
  requirementsDocument,
  onUpdateRequirementsSection,
  onShare,
  theme = 'dark',
}: ArtifactViewProps) {
  const solutionTitle = getSolutionTitle(artifact.solutionId);
  const showReqEditor =
    artifact.type === 'requirements_doc' && requirementsDocument && onUpdateRequirementsSection;

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8">
      <div className="mx-auto max-w-3xl">
        {showReqEditor ? (
          <RequirementsDocumentEditor
            document={requirementsDocument}
            onUpdateSection={onUpdateRequirementsSection}
          />
        ) : (
          <ArtifactDocumentPreview
            artifact={artifact}
            solutionTitle={solutionTitle}
            requirementsDocument={requirementsDocument}
            theme={theme}
            onShare={onShare}
          />
        )}
      </div>
    </div>
  );
}
