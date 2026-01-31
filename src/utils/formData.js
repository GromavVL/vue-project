export function toFormData (obj) {
  const fd = new FormData()
  if (!obj) return fd
  for (const key in obj) {
    fd.append(key, obj[key])
  }
  return fd
}
