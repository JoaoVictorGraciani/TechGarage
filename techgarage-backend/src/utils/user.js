const SAFE_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  createdAt: true,
};

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function publicUser(user) {
  if (!user) return null;

  const { password, ...safe } = user;
  return safe;
}

module.exports = {
  SAFE_USER_SELECT,
  normalizeEmail,
  publicUser,
};
