export function soDigitos(valor) {
  return valor.replace(/\D/g, "");
}

// Aceita qualquer CPF com 11 números
export function cpfValido(valor) {
  return soDigitos(valor).length === 11;
}
