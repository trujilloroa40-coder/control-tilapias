# Control Tilapias

Aplicacion web para registrar y consultar la produccion de tilapias por ciclos.
Su objetivo es apoyar el seguimiento de poblacion, alimentacion, crecimiento,
calidad del agua y gastos desde un computador o dispositivo movil.

Aplicacion publicada: https://control-tilapias.vercel.app

## Tecnologias

- Next.js 16, React 19 y TypeScript.
- Tailwind CSS para la interfaz responsive.
- Supabase Auth y PostgreSQL para autenticacion y datos.
- Recharts para graficas; Zod y React Hook Form para formularios.
- Manifest y service worker para instalacion como PWA.

## Requisitos

- Node.js compatible con Next.js 16 (version 20.9 o superior) y npm.
- Un proyecto Supabase propio con PostgreSQL y autenticacion configurados.
- Para gestionar migraciones localmente con Supabase CLI: Docker y las
  herramientas indicadas en la documentacion de Supabase.

## Instalacion y ejecucion local

1. Instala las dependencias:

   ```bash
   npm ci
   ```

2. Crea `.env.local` a partir de `.env.example` y completa los valores de tu
   proyecto Supabase:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

   La clave anon/publishable se usa en el navegador y debe estar protegida por
   las politicas de acceso de Supabase. Nunca publiques contrasenas, claves
   privadas ni service-role keys.

3. Inicia la aplicacion con `npm run dev`, abre http://localhost:3000 e inicia
   sesion con una cuenta creada en Supabase Authentication.

## Supabase y migraciones

Las migraciones SQL incluidas se encuentran en `supabase/migrations/`. Revisa
su contenido y aplicalas en orden solo a un proyecto Supabase propio o de
prueba; algunas incluyen datos demo. Con Supabase CLI puedes vincular el
proyecto adecuado y usar `supabase db push`. Comprueba el destino antes de
ejecutarlo y no reinicies bases con informacion que debas conservar.

Configura Auth y crea usuarios desde el panel de Supabase. La configuracion
local no garantiza la configuracion remota; revisa el registro publico y los
proveedores habilitados.

## Modulos

- Inicio y cierre de sesion.
- Creacion y seguimiento de ciclos productivos.
- Registros diarios de mortalidad, alimentacion y calidad del agua.
- Biometrias y graficas de crecimiento.
- Gastos, reportes por periodo y cierre del ciclo.
- Exportacion CSV y reporte final imprimible o guardable como PDF.

## Verificacion

```bash
npm run lint
npm run build
```

## Despliegue en Vercel

Importa el repositorio en Vercel como proyecto Next.js. Configura
`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en el entorno
correspondiente y despliega. Configura Supabase y sus URL de autenticacion
segun el dominio utilizado. No incluyas claves administrativas en variables
`NEXT_PUBLIC_*`.

## Limitaciones actuales

- Esta version permite que usuarios autenticados accedan a los mismos registros
  productivos mediante las politicas RLS incluidas. No proporciona aislamiento
  de datos entre cuentas y no debe emplearse con informacion privada de
  multiples usuarios sin implementar y probar nuevas politicas.
- El costo ingresado en alimentacion se registra por separado de los gastos y no
  se incorpora automaticamente al costo total del ciclo.
- Los reportes pueden imprimirse o guardarse como PDF desde el navegador; la
  exportacion CSV esta en Configuracion > Respaldo CSV.
- Esta copia se reconstruyo para la entrega academica y no se ha comprobado que
  coincida exactamente con el codigo desplegado en Vercel.
