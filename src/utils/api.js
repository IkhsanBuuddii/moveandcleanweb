export async function fetchData() {
  const res = await fetch('/data.json')
  if (!res.ok) throw new Error('Failed to fetch data.json')
  return res.json()
}

export async function getServices() {
  const data = await fetchData()
  return data.services
}

export async function getOrdersByUser(userId) {
  const data = await fetchData()
  return data.orders.filter(o => o.userId === userId)
}
