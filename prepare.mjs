import { readFile, writeFile } from 'node:fs/promises';
const host = process.env.SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
if (!host) throw new Error('Falta la URL del proyecto. En Vercel, activa las variables de sistema o añade SITE_URL con tu URL HTTPS.');
const url = new URL(/^https?:\/\//i.test(host) ? host : `https://${host}`);
if (!['https:', 'http:'].includes(url.protocol)) throw new Error('La URL debe ser HTTP o HTTPS.');
const template = await readFile(new URL('./index.template.html', import.meta.url), 'utf8');
await writeFile(new URL('./public/index.html', import.meta.url), template.replaceAll('__SITE_ORIGIN__', url.origin));
console.log(`Vista previa de cumpleaños configurada para ${url.origin}`);
