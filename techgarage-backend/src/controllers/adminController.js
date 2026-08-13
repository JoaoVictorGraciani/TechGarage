const prisma = require('../../database');

const REVENUE_STATUSES = ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

exports.dashboard = async (req, res) => {
  const now = new Date();
  const start30 = startOfDay(new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000));
  const start7 = startOfDay(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000));

  const [
    productsCount,
    usersCount,
    clientsCount,
    categoriesCount,
    lowStockCount,
    stockAggregate,
    orders,
    recentOrders,
    lowStockProducts,
    orderStatusGroups,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.user.count(),
    prisma.user.count({ where: { role: 'CLIENT' } }),
    prisma.category.count(),
    prisma.product.count({ where: { stock: { lte: 5 } } }),
    prisma.product.aggregate({ _sum: { stock: true } }),
    prisma.order.findMany({
      where: { createdAt: { gte: start30 } },
      select: { id: true, totalValue: true, status: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.order.findMany({ include: { user: { select: { id: true, name: true, email: true } } }, orderBy: { createdAt: 'desc' }, take: 7 }),
    prisma.product.findMany({ where: { stock: { lte: 5 } }, include: { category: true }, orderBy: [{ stock: 'asc' }, { name: 'asc' }], take: 8 }),
    prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
  ]);

  const revenueOrders = orders.filter((order) => REVENUE_STATUSES.includes(order.status));
  const revenue30 = revenueOrders.reduce((sum, order) => sum + Number(order.totalValue), 0);
  const ticketAverage = revenueOrders.length ? revenue30 / revenueOrders.length : 0;
  const revenueOrderIds = revenueOrders.map((order) => order.id);
  const topItems = revenueOrderIds.length
    ? await prisma.orderItem.groupBy({
        by: ['productId'],
        where: { orderId: { in: revenueOrderIds } },
        _sum: { quantity: true },
        _count: { _all: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      })
    : [];

  const sales7 = [];
  for (let offset = 0; offset < 7; offset += 1) {
    const day = new Date(start7.getTime() + offset * 24 * 60 * 60 * 1000);
    const next = new Date(day.getTime() + 24 * 60 * 60 * 1000);
    const dayOrders = orders.filter((order) => order.createdAt >= day && order.createdAt < next && REVENUE_STATUSES.includes(order.status));
    sales7.push({
      date: day.toISOString().slice(0, 10),
      revenue: dayOrders.reduce((sum, order) => sum + Number(order.totalValue), 0),
      orders: dayOrders.length,
    });
  }

  const statusCounts = Object.fromEntries(['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELED'].map((status) => [status, 0]));
  orderStatusGroups.forEach((group) => { if (statusCounts[group.status] !== undefined) statusCounts[group.status] = group._count._all; });

  const productIds = topItems.map((item) => item.productId);
  const topProductsData = productIds.length
    ? await prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, name: true, image: true, stock: true } })
    : [];
  const productMap = new Map(topProductsData.map((product) => [product.id, product]));
  const topProducts = topItems.map((item) => ({
    ...productMap.get(item.productId),
    quantitySold: item._sum.quantity || 0,
    orderLines: item._count._all,
  })).filter((item) => item.id);

  res.json({
    metrics: {
      products: productsCount,
      users: usersCount,
      clients: clientsCount,
      categories: categoriesCount,
      lowStock: lowStockCount,
      stockUnits: stockAggregate._sum.stock || 0,
      revenue30,
      revenueOrders30: revenueOrders.length,
      ticketAverage,
    },
    statusCounts,
    sales7,
    recentOrders,
    lowStockProducts,
    topProducts,
  });
};
