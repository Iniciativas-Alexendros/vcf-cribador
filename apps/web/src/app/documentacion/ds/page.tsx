import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { LoadingState } from "@/components/ui/loading-state";
import { ProgressStepper } from "@/components/ui/progress-stepper";

/**
 * Catálogo de átomos (fase 2) y patrones de estado (fase 3).
 * El catálogo visual completo vive en fase 4.
 * Traza: docs/gui/design-system-plan.md · epic #59.
 */
export default function DesignSystemCatalogPage() {
  return (
    <div className="zed-stack zed-catalog-grid">
      <PageHeader
        title="Átomos"
        eyebrow="sistema de diseño"
        description="Controles y estados alineados a tokens --zed-*. Wordmark: zedazo."
      />

      <Card variant="document">
        <h2 className="zed-title-section">Botón</h2>
        <p className="zed-muted">
          Variantes primario / secundario / terciario / peligro; tamaños md / sm;
          estados hover, foco visible, deshabilitado y carga.
        </p>
        <div className="zed-catalog-swatch">
          <Button variant="primary">Primario</Button>
          <Button variant="secondary">Secundario</Button>
          <Button variant="tertiary">Terciario</Button>
          <Button variant="danger">Peligro</Button>
          <Button variant="primary" size="sm">
            Compacto
          </Button>
          <Button variant="primary" disabled>
            Deshabilitado
          </Button>
          <Button variant="primary" loading>
            Cargando
          </Button>
          <IconButton label="Cerrar ejemplo">
            <Icon name="xmark" aria-hidden={true} />
          </IconButton>
        </div>
      </Card>

      <Card variant="document">
        <h2 className="zed-title-section">Badge</h2>
        <div className="zed-catalog-swatch">
          <Badge tone="neutral">Neutral</Badge>
          <Badge tone="info">Info</Badge>
          <Badge tone="success">Success</Badge>
          <Badge tone="warning">Warning</Badge>
          <Badge tone="danger">Danger</Badge>
          <Badge tone="technical">hash</Badge>
        </div>
      </Card>

      <Card variant="document">
        <h2 className="zed-title-section">Input</h2>
        <label className="zed-label" htmlFor="ds-input">
          Campo de ejemplo
        </label>
        <input
          id="ds-input"
          className="zed-input"
          defaultValue="texto sintético"
        />
        <label className="zed-label" htmlFor="ds-input-disabled">
          Deshabilitado
        </label>
        <input
          id="ds-input-disabled"
          className="zed-input"
          defaultValue="solo lectura de ejemplo"
          disabled
        />
      </Card>

      <Callout variant="info" title="Callout" icon="circle-info">
        Receta tokenizada (info / success / warning / danger / privacy).
      </Callout>
      <Callout variant="warning" title="Aviso" icon="triangle-exclamation">
        El foco visible usa --zed-focus-ring; no se retira el outline.
      </Callout>

      <Card variant="document">
        <h2 className="zed-title-section">Stepper</h2>
        <ProgressStepper
          steps={[
            { id: "archivo", label: "Archivo" },
            { id: "reglas", label: "Reglas" },
            { id: "salidas", label: "Salidas" },
          ]}
          current={1}
        />
      </Card>

      <Card variant="document">
        <h2 className="zed-title-section">Estados</h2>
        <EmptyState
          compact
          title="Vacío"
          description="Misma ilustración tipográfica en listados y fichas."
        />
        <LoadingState label="Cargando ejemplo…" lines={2} />
        <ErrorState title="Error de ejemplo" message="Mensaje sintético de fallo." />
      </Card>
    </div>
  );
}
