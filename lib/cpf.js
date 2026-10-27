export function soDigitos(valor) {
  return valor.replace(/\D/g, "");
}

export function cpfValido(valor) {
  return soDigitos(valor).length === 11;
}
