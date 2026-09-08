import { Callout } from "@/components/ui/callout";

type Props = {
  hours?: number | null;
};

export function RetentionNotice({ hours }: Props) {
  if (hours == null) {
    return (
      <Callout variant="privacy" title="Retención" icon="hard-drive">
        La política de retención de esta instancia se aplica al crear la
        ejecución. Consulta Ajustes para el detalle operativo.
      </Callout>
    );
  }
  return (
    <Callout variant="privacy" title="Retención" icon="hard-drive">
      Los artefactos de esta ejecución se conservan aproximadamente {hours} h
      según la configuración de la instancia.
    </Callout>
  );
}
