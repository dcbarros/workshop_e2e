import type { KeyboardEvent } from "react";
import type { Relationship } from "../types";

type RelationshipField = "name" | "relation" | "contact";

interface RelationshipInlineEditorProps {
  draft: Relationship;
  errors: Record<string, string>;
  editing: boolean;
  onChange: (field: RelationshipField, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function RelationshipInlineEditor({
  draft,
  errors,
  editing,
  onChange,
  onSave,
  onCancel,
}: RelationshipInlineEditorProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onCancel();
    } else if (event.key === "Enter") {
      event.preventDefault();
      onSave();
    }
  }

  return (
    <tr className="relationship-row--editing" data-cy="relationship-editor-row">
      <td>
        <input
          className={`relationship-inline-input ${errors.name ? "relationship-inline-input--error" : ""}`}
          id="relationship-name"
          data-cy="relationship-name"
          aria-label="Nome do relacionamento"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "relationship-name-error" : undefined}
          autoFocus
          required
          value={draft.name}
          onChange={(event) => onChange("name", event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nome completo"
          maxLength={50}
        />
        {errors.name ? (
          <span id="relationship-name-error" className="relationship-inline-error" role="alert">
            {errors.name}
          </span>
        ) : null}
      </td>
      <td>
        <input
          className="relationship-inline-input"
          id="relationship-relation"
          data-cy="relationship-relation"
          aria-label="Tipo de relação"
          value={draft.relation}
          onChange={(event) => onChange("relation", event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ex.: Cônjuge"
          maxLength={30}
        />
      </td>
      <td>
        <input
          className={`relationship-inline-input ${errors.contact ? "relationship-inline-input--error" : ""}`}
          id="relationship-contact"
          data-cy="relationship-contact"
          aria-label="Contato do relacionamento"
          aria-invalid={Boolean(errors.contact)}
          aria-describedby={errors.contact ? "relationship-contact-error" : undefined}
          required
          value={draft.contact}
          onChange={(event) => onChange("contact", event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Telefone, e-mail…"
          maxLength={30}
        />
        {errors.contact ? (
          <span id="relationship-contact-error" className="relationship-inline-error" role="alert">
            {errors.contact}
          </span>
        ) : null}
      </td>
      <td className="actions-cell">
        <div className="relationship-inline-actions">
          <button
            className="button button--primary"
            type="button"
            onClick={onSave}
            data-cy="relationship-save"
          >
            {editing ? "Salvar edição" : "Adicionar"}
          </button>
          <button
            className="button button--ghost"
            type="button"
            onClick={onCancel}
            data-cy="relationship-cancel"
          >
            Cancelar
          </button>
        </div>
      </td>
    </tr>
  );
}
