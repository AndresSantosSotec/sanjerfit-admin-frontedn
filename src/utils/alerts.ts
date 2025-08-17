/**
 * Simple alert helpers. Replace with SweetAlert2 if available.
 */
export async function confirmAction(
  title: string,
  text?: string,
  _confirmButtonText = 'Sí, continuar'
): Promise<boolean> {
  const message = text ? `${title}\n\n${text}` : title;
  return window.confirm(message);
}

export function toastSuccess(title: string) {
  // Placeholder success notification
  window.alert(title);
}

export function toastError(title: string) {
  // Placeholder error notification
  window.alert(title);
}
