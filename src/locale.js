/* Locale class */

var Locale = Locale || {};
Locale.dict = {
  "es": {
    "exposure": "Exposición",
    "contrast": "Contraste",
    "brightness": "Brillo",
    "whites": "Claros",
    "highlights": "Luces",
    "shadows": "Sombras",
    "blacks": "Oscuros",
    "temperature": "Temperatura",
    "tint": "Matiz",
    "saturation": "Saturación",
    "vibrance": "Vibrancia",
    "bAndW": "Blanco y negro",
    "sharpen": "Detalles",
    "sharpen_radius": "Radio de detalle",
    "masking": "Máscara",
    "radiance": "Radiancia",
    "dehaze": "Niebla",
    "atmosferic_light": "Luz atmosférica",
    "hdr": "Alto rango dinámico",
    "lightColor": "Color",
    "lightFill": "Cantidad",
    "lightSat": "Cantidad",
    "darkColor": "Color",
    "darkFill": "Cantidad",
    "darkSat": "Cantidad",
    "image_no_loaded": "No hay ninguna imagen cargada. Para editar, cargue una imagen.",
    "image_save_title": "¿Desea guardar la imagen?",
    "image_save_text": "Nombre de la imagen (Resolución máxima: 10Mpx) :"
  }
};
Locale.current = "es";
Locale.get = function(value) {
  if (Locale.dict[Locale.current][value]) {
    return Locale.dict[Locale.current][value];
  }
  return value;
}
