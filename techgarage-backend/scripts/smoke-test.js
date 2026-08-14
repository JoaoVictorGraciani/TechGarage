require('dotenv').config();

const base = String(process.env.SMOKE_API_URL || `http://localhost:${process.env.PORT || 3000}/api`).replace(/\/$/, '');
let failures = 0;

async function check(name, path, expectedStatus, validate) {
  try {
    const response = await fetch(`${base}${path}`, { redirect: 'manual' });
    let body = null;
    try { body = await response.json(); } catch { /* endpoint pode não retornar JSON */ }
    const statusOk = response.status === expectedStatus;
    const bodyOk = validate ? Boolean(validate(body)) : true;
    if (statusOk && bodyOk) {
      console.log(`PASS  ${name}`);
      return;
    }
    failures += 1;
    console.error(`FAIL  ${name} | status=${response.status} esperado=${expectedStatus}`, body || '');
  } catch (error) {
    failures += 1;
    console.error(`FAIL  ${name} | ${error.message}`);
  }
}

async function main() {
  console.log(`\nSmoke test: ${base}\n`);
  await check('Health + banco', '/health', 200, (body) => body?.status === 'ok' && body?.database === 'ok');
  await check('Produtos públicos', '/products', 200, Array.isArray);
  await check('Categorias públicas', '/categories', 200, Array.isArray);
  await check('ID de produto inválido', '/products/abc', 400, (body) => typeof body?.message === 'string');
  await check('Admin protegido sem sessão', '/admin/dashboard', 401, (body) => typeof body?.message === 'string');
  await check('Serper protegido sem sessão', '/serper/images?q=notebook', 401, (body) => typeof body?.message === 'string');

  if (failures) {
    console.error(`\n${failures} teste(s) falharam.\n`);
    process.exitCode = 1;
  } else {
    console.log('\nTodos os smoke tests passaram.\n');
  }
}

main();
