export const API = import.meta.env.VITE_API_BASE || ''

export async function fetchJson(url, opts) {
  const res = await fetch(url, opts)
  if (res.ok) {
    // try to parse JSON, but return null if body empty
    try {
      return await res.json()
    } catch (e) {
      return null
    }
  }
  const err = await res.json().catch(() => ({ message: res.statusText }))
  throw new Error(err.message || 'Request failed')
}

export async function getServices() {
  try {
    return await fetchJson(`${API}/api/services`)
  } catch (err) {
    console.warn('getServices failed, falling back to static', err)
    const res = await fetch('/data.json')
    if (!res.ok) throw new Error('Failed to fetch data.json')
    const data = await res.json()
    return data.services
  }
}

export async function getVendors() {
  return await fetchJson(`${API}/api/vendors`)
}

export async function getVendorById(id) {
  return await fetchJson(`${API}/api/vendors/${id}`)
}

export async function createVendor({ user_id, vendor_name, description, location }) {
  return await fetchJson(`${API}/api/vendors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, vendor_name, description, location }),
  })
}

export async function getServicesByVendor(vendorId) {
  return await fetchJson(`${API}/api/vendors/${vendorId}/services`)
}

export async function createService({ vendor_id, title, price, duration, category, image_url }) {
  const payload = { vendor_id, title, price, duration, category }
  if (typeof image_url !== 'undefined') payload.image_url = image_url
  return await fetchJson(`${API}/api/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function uploadImage(file) {
  const form = new FormData()
  form.append('image', file)
  const res = await fetch(`${API}/api/upload`, { method: 'POST', body: form })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || 'Upload failed')
  }
  const r = await res.json()
  // prefer signedUrl if available (for private buckets), else public url
  return { url: r.signedUrl || r.url }
}

export async function updateService(id, payload) {
  return await fetchJson(`${API}/api/services/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function deleteService(id) {
  return await fetchJson(`${API}/api/services/${id}`, { method: 'DELETE' })
}

export async function getOrdersByUser(userId) {
  try {
    return await fetchJson(`${API}/api/orders/${userId}`)
  } catch (err) {
    console.warn('getOrdersByUser failed, falling back to static', err)
    const res = await fetch('/data.json')
    if (!res.ok) throw new Error('Failed to fetch data.json')
    const data = await res.json()
    return data.orders.filter((o) => o.userId === userId)
  }
}

export async function getOrdersByVendor(vendorId) {
  return await fetchJson(`${API}/api/vendors/${vendorId}/orders`)
}

export async function updateOrderStatus(orderId, status) {
  return await fetchJson(`${API}/api/orders/${orderId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
}

export async function createOrder({ user_id, vendor_id, service_id, total, scheduled_at, notes }) {
  return await fetchJson(`${API}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, vendor_id, service_id, total, scheduled_at, notes }),
  })
}

export async function getOrderById(orderId) {
  return await fetchJson(`${API}/api/orders/order/${orderId}`)
}

export async function getMessages(orderId) {
  return await fetchJson(`${API}/api/orders/${orderId}/messages`)
}

export async function postMessage(orderId, { sender_id, text }) {
  return await fetchJson(`${API}/api/orders/${orderId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sender_id, text }),
  })
}
