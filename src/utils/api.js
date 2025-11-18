// API helpers — prefer backend endpoints, fall back to public/data.json in dev
export async function fetchData() {
  // keep existing fallback for static dev data
  const res = await fetch('/data.json')
  if (!res.ok) throw new Error('Failed to fetch data.json')
  return res.json()
}

export async function getServices() {
  try {
    const res = await fetch('http://localhost:3000/api/services')
    if (res.ok) return res.json()
    // if backend returns error, fallback to static
    console.warn('Backend /api/services returned non-ok, falling back to /data.json')
  } catch (err) {
    console.warn('Could not reach backend /api/services, falling back to /data.json', err)
  }
  const data = await fetchData()
  return data.services
}

export async function getOrdersByUser(userId) {
  try {
    const res = await fetch(`http://localhost:3000/api/orders/${userId}`)
    if (res.ok) return res.json()
    console.warn('Backend /api/orders returned non-ok, falling back to /data.json')
  } catch (err) {
    console.warn('Could not reach backend /api/orders, falling back to /data.json', err)
  }

  const data = await fetchData()
  return data.orders.filter((o) => o.userId === userId)
}

export async function createOrder({ user_id, vendor_id, service_id, total }) {
  const res = await fetch('http://localhost:3000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, vendor_id, service_id, total }),
  })
  return res.ok ? res.json() : Promise.reject(await res.json())
}
